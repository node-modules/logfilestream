TESTS = test/*.test.js
REPORTER = spec
TIMEOUT = 2000
JSCOVERAGE = ./node_modules/jscover/bin/jscover
MOCHA = ./node_modules/mocha/bin/mocha

install:
	@npm install

test: install
	@NODE_ENV=test $(MOCHA) \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-cov: install lib-cov
	@LOGSTREAM_COV=1 $(MAKE) test REPORTER=dot
	@LOGSTREAM_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@rm -rf ./lib-cov
	@$(JSCOVERAGE) lib $@

.PHONY: test-cov test lib-cov