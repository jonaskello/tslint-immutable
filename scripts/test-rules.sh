#!/bin/bash
set -v

# Compile all rules
./node_modules/.bin/tsc -p .

# Now run the tests
#./node_modules/.bin/tslint --test test/rules/readonly-keyword/default
#./node_modules/.bin/tslint --test test/rules/readonly-keyword/ignore-prefix
#./node_modules/.bin/tslint --test test/rules/readonly-keyword/work

find test -type f -name '*.lint' -exec dirname {} \; | sort -u | xargs -n 1 ./node_modules/.bin/tslint --test
