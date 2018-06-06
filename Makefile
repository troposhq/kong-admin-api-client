.PHONY: dev reset-dev test

dev:
	docker-compose up -d

reset-dev:
	docker-compose down

test:
	$(MAKE) reset-dev && \
	$(MAKE) dev && \
	sleep 7 && \
	npm test