@echo off
setlocal

for /f "tokens=*" %%I in ('npm root -g') do set NPM_GLOBAL=%%I
if not exist "%NPM_GLOBAL%\@ms" mkdir "%NPM_GLOBAL%\@ms"

for /d %%I in (*.*) do call :link %%I
goto :eof

:link
if NOT "%1"=="common" (
    if NOT "%1"=="node_modules" (
        rmdir "%NPM_GLOBAL%\@ms\%1" 2> NUL
        mklink /D "%NPM_GLOBAL%\@ms\%1" "%~dp0%1"
    )
)