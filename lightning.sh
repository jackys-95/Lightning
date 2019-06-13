#!/bin/bash

STREAM_STATUS=$(curl -sH 'Accept: application/vnd.twitchtv.v5+json' \
	-H "Client-ID: $TWITCH_CLIENT_ID" \
	-X GET "https://api.twitch.tv/helix/streams?user_login=$TWITCH_USER_NAME" | jq -r ".data[0]")

echo $STREAM_STATUS
if [ "$STREAM_STATUS" = "null" ]; then
	echo "The user $TWITCH_USER_NAME is not streaming."
else
	echo "The user $TWITCH_USER_NAME is streaming!"
fi