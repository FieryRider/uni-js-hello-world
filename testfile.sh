#!/bin/bash

RED_COLOR='\033[0;31m'
NO_COLOR='\033[0m'

gen_date() {
  date -d "@$(shuf -i $(date -d '2018-01-01' +%s)-$(date -d '2019-02-01' +%s) -n 1)" +%d.%m.%Y
}

#$1 - from, $2 - to
gen_rand() {
  echo $(( ( $RANDOM % ( $(( $2 - $1 )) + 1 )) + $1 ))
}

#ADD EVENTS
for i in {1..30}; do
  if [[ $RANDOM -lt 10000 ]]; then
    ageRestriction=true
  else
    ageRestriction=false
  fi
  if [[ $RANDOM -lt 5000 ]]; then
    date=true
  else
    date=false
  fi

  if $ageRestriction && $date; then
    printf "${RED_COLOR}node app.js add-event name event$i ageRestriction 18+ date $(gen_date)${NO_COLOR}\n"
    node app.js add-event name "event$i" ageRestriction 18+ date $(gen_date)
  elif $ageRestriction; then
    printf "${RED_COLOR}node app.js add-event name event$i ageRestriction 18+${NO_COLOR}\n"
    node app.js add-event name "event$i" ageRestriction 18+
  elif $date; then
    printf "${RED_COLOR}node app.js add-event name event$i date $(gen_date)${NO_COLOR}\n"
    node app.js add-event name "event$i" date $(gen_date)
  else
    printf "${RED_COLOR}node app.js add-event name event$i${NO_COLOR}\n"
    node app.js add-event name "event$i"
  fi
done
printf "${RED_COLOR}node app.js list-events${NO_COLOR}\n"
node app.js list-events
events_ids=($(node app.js list-events | grep -o '^[^.]*' | paste -s -d' '))

read -p ""
#EDIT EVENTS
for i in {1..2}; do
  printf "${RED_COLOR} node app.js edit-event $(node app.js list-events | grep 18+ | shuf -n 1 | grep -oE '^[^.]+') ageRestriction няма${NO_COLOR}"
  node app.js edit-event $(node app.js list-events | grep 18+ | shuf -n 1 | grep -oE '^[^.]+') ageRestriction няма
done
printf "${RED_COLOR}node app.js list-events${NO_COLOR}\n"
node app.js list-events
for i in {1..2}; do
  node app.js edit-event $(node app.js list-events | grep няма | shuf -n 1 | grep -oE '^[^.]+') ageRestriction 18+
done
printf "${RED_COLOR}node app.js list-events${NO_COLOR}\n"
node app.js list-events

read -p ""
#DELETE EVENTS
events_for_deletion=()
while true; do
  while [[ ${#events_for_deletion[@]} -lt 7 ]]; do
    events_for_deletion+=( ${events_ids[$(gen_rand 0 $(( ${#events_ids[@]} - 1 )) )]} )
  done
  events_for_deletion=($(for value in ${events_for_deletion[@]}; do echo $value; done | sort | uniq | xargs))
  if [[ ${#events_for_deletion[@]} -eq 7 ]]; then
    break
  fi
done
for i in ${events_for_deletion[@]}; do
  printf "${RED_COLOR}node app.js delete-event $i${NO_COLOR}\n"
  node app.js delete-event $i
done
printf "${RED_COLOR}node app.js list-events${NO_COLOR}\n"
node app.js list-events

read -p ""
#ADD CLIENTS
for i in {1..100}; do
  if [[ $(( ( RANDOM % 2) + 1 )) -eq 2 ]]; then
    printf "${RED_COLOR}node app.js add-client Клиент$i ж $(( ( RANDOM % 90) + 10 ))${NO_COLOR}\n"
    node app.js add-client "Клиент$i" ж $(( ( RANDOM % 90) + 10 ))
  else
    printf "${RED_COLOR}node app.js add-client Клиент$i м $(( ( RANDOM % 90) + 10 ))${NO_COLOR}\n"
    node app.js add-client "Клиент$i" м $(( ( RANDOM % 90) + 10 ))
  fi
done
printf "${RED_COLOR}node app.js list-clients${NO_COLOR}\n"
node app.js list-clients

read -p ""
#ADD CLIENTS TO EVENTS
client_names=($(node app.js list-clients | grep -oP '(?<=Име: )[^,]+' | paste -s -d' '))
events_ids=($(node app.js list-events | grep -o '^[^.]*' | paste -s -d' '))
events_with_clients_ids=()
for i in {1..60}; do
  event_id=${events_ids[$(( $RANDOM % ${#events_ids[@]} ))]}
  #HERE BE DRAGONS
  client_name=${client_names[$(( $RANDOM % ${#client_names[@]} ))]}
  printf "${RED_COLOR}node app.js add-client-event $event_id $client_name${NO_COLOR}\n"
  [[ $(node app.js add-client-event $event_id "$client_name") == '' ]] && 
    events_with_clients_ids+=($event_id)

done

for i in ${events_with_clients_ids[@]}; do
  printf "${RED_COLOR}node app.js list-event-clients $i${NO_COLOR}\n"
  node app.js list-event-clients $i
done

read -p ""
#REMOVE CLIENTS FROM EVENTS
remove_count=$(( ${#events_with_clients_ids[@]} / 3 ))
for i in {1..$remove_count}; do
  event_id=${events_with_clients_ids[$(($RANDOM % ${#events_with_clients_ids[@]}))]}
  client_name=$(node app.js list-event-clients $event_id | shuf -n 1 | grep -oP '(?<=Име: ).+(?=,)')
  printf "${RED_COLOR}node app.js remove-event-client $event_id $client_name${NO_COLOR}\n"
  node app.js remove-event-client $event_id $client_name
done

for i in ${events_with_clients_ids[@]}; do
  printf "${RED_COLOR}node app.js list-event-clients $i${NO_COLOR}\n"
  node app.js list-event-clients $i
done
