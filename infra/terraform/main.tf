provider "aws" {
  region = "us-west-2"  # Replace with your preferred region
}

data "aws_security_group" "existing_sg" {
  name = "default"  # Replace with your security group name
}

resource "aws_instance" "app_server" {
  ami           = "ami-0a38c1c38a15fed74"  # Amazon Linux 2 AMI
  instance_type = "t2.micro"

  key_name = var.key_name  # Replace with your SSH key name

  vpc_security_group_ids = [data.aws_security_group.existing_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y

              # Install Docker
              sudo amazon-linux-extras install docker -y
              sudo service docker start
              sudo usermod -a -G docker ec2-user
              
              # Clone your application repository
              git clone https://github.com/retr0-spection/campus-transport-server.git /home/ec2-user/app

              # Change to the app directory
              cd /home/ec2-user/app

              # Build Docker image from Dockerfile
              sudo docker build -t campus-transport-server .

              # Run the Docker container with auto-restart
              sudo docker run -d --restart unless-stopped -p 80:3000 campus-transport-server
              EOF

  tags = {
    Name = "DockerAppServer"
  }
}

output "instance_ip" {
  value = aws_instance.app_server.public_ip
}
