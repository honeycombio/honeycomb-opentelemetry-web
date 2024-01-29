# UTILITY FUNCS

# Span names for a given scope
# Arguments: $1 - scope name
span_names_for() {
	spans_from_scope_named $1 | jq '.name'
}

# Attributes for a given scope
# Arguments: $1 - scope name
span_attributes_for() {
	spans_from_scope_named $1 | \
		jq ".attributes[]"
}

# All resource attributes
resource_attributes_received() {
	spans_received | jq ".resource.attributes[]?"
}

# Spans for a given scope
# Arguments: $1 - scope name
spans_from_scope_named() {
	spans_received | jq ".scopeSpans[] | select(.scope.name == \"$1\").spans[]"
}

# Metrics for a given scope
# Arguments: $1 - scope name
metrics_from_scope_named() {
	metrics_received | jq ".scopeMetrics[] | select(.scope.name == \"$1\").metrics[]"
}

# All spans received
spans_received() {
	jq ".resourceSpans[]?" ./collector/data.json
}

# All metrics received
metrics_received() {
	jq ".resourceMetrics[]?" ./collector/data.json
}


# Metric names for a given scope
# Arguments: $1 - scope name
metric_names_for() {
	metrics_from_scope_named $1 | jq '.name'
}

# Arguments
# $1 - retry limit (default 5); Nth retry sleeps for N seconds
wait_for_metrics() {
	echo -n "# ⏳ Waiting for collector to receive metrics" >&3
	NEXT_WAIT_TIME=0
	MAX_RETRIES=${1:-5}
	until [ $NEXT_WAIT_TIME -eq $MAX_RETRIES ] || [ "$(metrics_received)" != "" ]
	do
		echo -n " ... $(( NEXT_WAIT_TIME++ ))s" >&3
		sleep $NEXT_WAIT_TIME
	done
	echo "" >&3
	[ $NEXT_WAIT_TIME -lt $MAX_RETRIES ]
}

# Arguments
# $1 - retry limit (default 5); Nth retry sleeps for N seconds
wait_for_data() {
	echo -n "# ⏳ Waiting for collector to receive data" >&3
	NEXT_WAIT_TIME=0
	MAX_RETRIES=${1:-5}
	until [ $NEXT_WAIT_TIME -eq $MAX_RETRIES ] || [ "$(wc -l ./collector/data.json | awk '{ print $1 }')" -ne 0 ]
	do
		echo -n " ... $(( NEXT_WAIT_TIME++ ))s" >&3
		sleep $NEXT_WAIT_TIME
	done
	echo "" >&3
	[ $NEXT_WAIT_TIME -lt $MAX_RETRIES ]
}

# Arguments
# $1 - retry limit (default 5); Nth retry sleeps for N seconds
wait_for_traces() {
	echo -n "# ⏳ Waiting for collector to receive traces" >&3
	NEXT_WAIT_TIME=0
	MAX_RETRIES=${1:-5}
	until [ $NEXT_WAIT_TIME -eq $MAX_RETRIES ] || [ "$(spans_received)" != "" ]
	do
		echo -n " ... $(( NEXT_WAIT_TIME++ ))s" >&3
		sleep $NEXT_WAIT_TIME
	done
	echo "" >&3
	[ $NEXT_WAIT_TIME -lt $MAX_RETRIES ]
}

wait_for_flush() {
	echo -n "# ⏳ Waiting for collector data flush" >&3
	NEXT_WAIT_TIME=0
	until [ $NEXT_WAIT_TIME -eq 5 ] || [ "$(wc -l ./collector/data.json | awk '{ print $1 }')" -eq 0 ]
	do
		echo -n " ... $(( NEXT_WAIT_TIME++ ))s" >&3
		sleep $NEXT_WAIT_TIME
	done
	echo "" >&3
	[ $NEXT_WAIT_TIME -lt 5 ]
}

# Wait loop for one of our example apps to be started and ready to receive traffic.
#
# Arguments:
#   $1 - the name of the container/service in which the app is running
wait_for_ready_app() {
	CONTAINER=${1:?container name is a required parameter}
	MAX_RETRIES=10
	echo -n "# 🍿 Setting up ${CONTAINER}" >&3
	NEXT_WAIT_TIME=0
	until [ $NEXT_WAIT_TIME -eq $MAX_RETRIES ] || [[ $(docker-compose logs ${CONTAINER} | grep "Accepting connections at") ]]
	do
		echo -n " ... $(( NEXT_WAIT_TIME++ ))s" >&3
		sleep $NEXT_WAIT_TIME
	done
	echo "" >&3
	[ $NEXT_WAIT_TIME -lt $MAX_RETRIES ]
}

# ASSERTION HELPERS

# Fail and display details if the expected and actual values do not
# equal. Details include both values.
#
# Inspired by bats-assert * bats-support, but dramatically simplified
# Arguments:
# $1 - actual result
# $2 - expected result
assert_equal() {
	if [[ $1 != "$2" ]]; then
		{
			echo
			echo "-- 💥 values are not equal 💥 --"
			echo "expected : $2"
			echo "actual   : $1"
			echo "--"
			echo
		} >&2 # output error to STDERR
		return 1
	fi
}

# Fail and display details if the actual value is empty.
# Arguments: $1 - actual result
assert_not_empty() {
	EMPTY=(\"\")
	if [[ "$1" == "${EMPTY}" ]]; then
		{
			echo
			echo "-- 💥 value is empty 💥 --"
			echo "value : $1"
			echo "--"
			echo
		} >&2 # output error to STDERR
		return 1
	fi
}
