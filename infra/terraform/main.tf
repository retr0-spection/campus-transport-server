provider "aws" {
  region = "us-west-2"  # Replace with your preferred region
}

resource "aws_instance" "app_server" {
  ami           = "ami-0ae8f15ae66fe8cda"  # Amazon Linux 2 AMI
  instance_type = "t2.micro"

  key_name = var.key_name

  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
              sudo yum install -y nodejs
              sudo npm install -g pm2
              git clone https://github.com/retr0-spection/campus-transport-server.git /home/ec2-user/app
              cd /home/ec2-user/app
              npm install --production
              pm2 start src/bin/ww.js
              EOF

  tags = {
    Name = "ExpressAppServer"
  }
}

resource "aws_security_group" "app_sg" {
  name        = "app_sg"
  description = "Allow SSH and HTTP/HTTPS traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "instance_ip" {
  value = aws_instance.app_server.public_ip
}
