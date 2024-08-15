provider "aws" {
  region = "us-west-2"  # Replace with your preferred region
}


data "aws_security_group" "existing_sg" {
  name = "default"  # Replace with your security group name
}

resource "aws_instance" "app_server" {
  ami           = "ami-0a38c1c38a15fed74"  # Amazon Linux 2 AMI
  instance_type = "t2.micro"

  key_name = var.key_name

  vpc_security_group_ids = [data.aws_security_group.existing_sg.id]

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


output "instance_ip" {
  value = aws_instance.app_server.public_ip
}
