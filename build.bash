#!/bin/bash

# "Compile" grammar.js, from grammar.ne
npx nearleyc -o ./plugins/grammar.js ./plugins/grammar.ne -e spr_grammar

# package it using esbuild
node ./build.mjs
