FROM python:3.12

ENV PYTHONUNBUFFERED=1

WORKDIR /back

RUN pip install --upgrade pip
RUN apt-get update && apt-get install -y netcat-openbsd
RUN apt-get install -y wget unzip && \
	wget https://releases.hashicorp.com/vault/1.18.0/vault_1.18.0_linux_amd64.zip && \
	unzip -o vault_1.18.0_linux_amd64.zip -d /usr/local/bin/ && \
	rm vault_1.18.0_linux_amd64.zip && \
	apt-get clean && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /back/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /back

COPY ./script.sh /back/script.sh
RUN chmod +x /back/script.sh

EXPOSE 8000

CMD ["sh", "/back/script.sh"]