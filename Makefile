.PHONY: dev reset-dev test

dev:
	docker-compose up -d

reset-dev:
	docker-compose down && \
	$(MAKE) dev

test:
	$(MAKE) reset-test && \
	docker-compose -f docker-compose.test.yml up -d && \
	sleep 10 && \
	npm test

reset-test:
	docker-compose -f docker-compose.test.yml down