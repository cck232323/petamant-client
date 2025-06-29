#!/bin/bash

token="YOUR_TOKEN"
url="http://localhost:8081/api/Activities"

# declare -a events=(
# '{"title":"Paws in the Park","description":"Fun dog event","date":"2025-07-01T10:00:00Z","location":"Central Park"}'
# '{"title":"Cat Yoga","description":"Stretch with cats","date":"2025-07-02T15:00:00Z","location":"Meow Lounge"}'
# '{"title":"Pet Adoption Day","description":"Meet adoptable pets","date":"2025-07-03T10:00:00Z","location":"Downtown Shelter"}'
# )
declare -a events=(
'{"title":"Dog Costume Parade","description":"Dress your pup in fun outfits","date":"2025-07-04T14:00:00Z","location":"Pet Plaza"}'
'{"title":"Puppy Splash Day","description":"Water play fun for dogs","date":"2025-07-05T12:00:00Z","location":"Splash Park"}'
'{"title":"Cat Cafe Meetup","description":"Coffee and cats social","date":"2025-07-06T10:00:00Z","location":"Whisker Cafe"}'
'{"title":"Vet Q&A Session","description":"Talk to local veterinarians","date":"2025-07-07T16:00:00Z","location":"Community Center"}'
'{"title":"Pet First Aid Workshop","description":"Learn emergency care for pets","date":"2025-07-08T11:00:00Z","location":"Health Hall"}'
'{"title":"Hamster Wheel Race","description":"Fastest hamster wins","date":"2025-07-09T13:30:00Z","location":"Tiny Track Stadium"}'
'{"title":"Bird Song Contest","description":"Whistle and chirp showdown","date":"2025-07-10T09:00:00Z","location":"Avian Arena"}'
'{"title":"Dog Hiking Adventure","description":"Group hike with dogs","date":"2025-07-11T07:00:00Z","location":"Trailhead Park"}'
'{"title":"Fish Bowl Expo","description":"Aquarium display and tips","date":"2025-07-12T14:30:00Z","location":"Aqua Center"}'
'{"title":"Pet Portrait Day","description":"Free photos for your pet","date":"2025-07-13T15:00:00Z","location":"Studio Paws"}'
'{"title":"Rabbit Hop Contest","description":"See who hops the farthest","date":"2025-07-14T10:00:00Z","location":"Bunny Field"}'
'{"title":"Senior Dog Social","description":"Meet other older dogs","date":"2025-07-15T17:00:00Z","location":"Sunset Paws Park"}'
'{"title":"Pet Trick Showcase","description":"Show off your pet’s talents","date":"2025-07-16T13:00:00Z","location":"Main Stage"}'
'{"title":"Pet Nutrition Talk","description":"Learn about healthy diets","date":"2025-07-17T12:00:00Z","location":"Wellness Room"}'
'{"title":"Dog Agility Course","description":"Try the obstacle course","date":"2025-07-18T09:30:00Z","location":"Agility Arena"}'
'{"title":"Pet Camping Weekend","description":"Overnight outdoor fun","date":"2025-07-19T16:00:00Z","location":"Woof Woods"}'
'{"title":"Pet Art Workshop","description":"Paint your pet’s portrait","date":"2025-07-20T11:00:00Z","location":"Creative Corner"}'
'{"title":"Turtle Walk Day","description":"Slow and steady event","date":"2025-07-21T08:00:00Z","location":"Turtle Bay"}'
'{"title":"Pet Costume Ball","description":"Dance and costume fun","date":"2025-07-22T18:00:00Z","location":"Fur Ballroom"}'
'{"title":"Adopt-a-Thon","description":"Meet pets looking for homes","date":"2025-07-23T10:00:00Z","location":"Rescue Center"}'
)

for data in "${events[@]}"
do
  curl -X POST "$url" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiIxMjM0NTY3OEBnbWFpbC5jb20iLCJlbWFpbCI6IjEyMzQ1Njc4QGdtYWlsLmNvbSIsIm5iZiI6MTc1MTE4Njc5MywiZXhwIjoxNzUxNzkxNTkzLCJpYXQiOjE3NTExODY3OTMsImlzcyI6InBldGFtYW50IiwiYXVkIjoicGV0YW1hbnQtY2xpZW50cyJ9.046Am4F4nArVqdjSkq3Sa0QqiagceL-TDf6PTnTl-Vs" \
    -H "Content-Type: application/json" \
    -d "$data"
  echo ""  # newline between outputs
done