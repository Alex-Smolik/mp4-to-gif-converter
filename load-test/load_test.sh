URL="http://localhost:3000/upload"
VIDEO="test.mp4"
REQUESTS=1000
CONCURRENT=50

echo "Starting Load Test: Sending $REQUESTS requests to $URL..."

for ((i = 1; i <= REQUESTS; i++)); do
  curl -X POST -F "video=@$VIDEO" $URL -o /dev/null -s &

  if (( i % CONCURRENT == 0 )); then
    wait
  fi
done

wait
echo "✅ Load Test Completed: Sent $REQUESTS requests!"
