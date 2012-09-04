TESTS = test/*.js
REPORTER = spec
TIMEOUT = 2000
JSCOVERAGE = jscoverage
MOCHA = ./node_modules/mocha/bin/mocha

test:
	@npm install
	@NODE_ENV=test $(MOCHA) \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-cov: lib-cov
	@LOGSTREAM_COV=1 $(MAKE) test REPORTER=dot
	@LOGSTREAM_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@rm -rf ./lib-cov
	@$(JSCOVERAGE) lib $@

.PHONY: test-cov test lib-cov