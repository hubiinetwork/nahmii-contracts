#!/usr/bin/env bash

dir=$1

if [[ ! -d $dir ]]; then
    echo "Contract abstractions directory '$dir' not found" >&2
    exit 1
fi

cd $dir

grep "address\":" *.json | sed -e 's/\.json:[[:space:]]*"address": "\(0x[a-z0-9]*\)",*/: \1/'
