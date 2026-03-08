#!/bin/bash
# Install system dependencies for Python packages
apt-get update
apt-get install -y \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libharfbuzz0b \
    libwebp-dev

# Install Python dependencies
pip install -r requirements.txt
