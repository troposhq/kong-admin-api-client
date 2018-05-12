.PHONY: dev reset-dev

dev:
	docker-compose up -d

reset-dev:
	docker-compose down && \
	$(MAKE) dev