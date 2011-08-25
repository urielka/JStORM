#!/bin/bash
java -cp "lib/sqlitejdbc.jar:lib/mysql.jar:lib/js.jar" org.mozilla.javascript.tools.shell.Main jdbc_tester.js $1 $2