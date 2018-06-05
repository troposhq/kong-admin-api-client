.PHONY: dev reset-dev test

dev:
	docker-compose up -d

reset-dev:
	docker-compose down && \
	$(MAKE) dev

test:
	docker-compose -f docker-compose.test.yml up -d && \
	sleep 5 && \
	npm test && \
	$(MAKE) reset-test

reset-test:
	docker-compose -f docker-compose.test.yml down