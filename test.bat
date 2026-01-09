:: Test Runner Wrapper for Local by Flywheel
:: 
:: Usage: .\test.bat
::
@echo off
SET PHP_BIN="C:\Users\suker\AppData\Roaming\Local\lightning-services\php-8.2.27+1\bin\win64\php.exe"
SET PHP_INI="C:\Users\suker\AppData\Roaming\Local\run\41iJdtYte\conf\php\php.ini"

echo Running all regression tests...
%PHP_BIN% -c %PHP_INI% tests/run-all-tests.php
if %errorlevel% neq 0 (
    echo.
    echo Tests Failed!
    exit /b %errorlevel%
)
echo.
echo All Tests Passed.
