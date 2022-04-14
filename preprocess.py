from dataclasses import field
from os import listdir
from os.path import isfile, join
from typing import OrderedDict
import csv
import re

transcript_dir = join('.','transcripts')

seasons = [d for d in listdir(transcript_dir) if not isfile(join(transcript_dir, d))]

data_dict = OrderedDict()

for season in seasons:
    data_dict[season] = OrderedDict()
    season_dir_items = listdir(join(transcript_dir, season))

    # List of episode nums in this season, sorted by number value
    episode_nums = sorted([int(f.replace("episode","").replace(".txt","")) for f in [f for f in season_dir_items]])

    for episode_num in episode_nums:
        data_dict[season][episode_num] = OrderedDict()
        with open(join(transcript_dir, season, 'episode' + str(episode_num) + '.txt')) as episode_transcript:
            scene_count = 0
            line_count = 0
            for line in episode_transcript.readlines():
                line = line.lower().strip()
                line = line.replace('\xa0',' ')
                line = line.replace('"', '')
                line = line.replace(',', '')
                regexFindPattern = re.compile('\(.*\)|\[.*\]')
                line = ''.join(regexFindPattern.split(line)).replace('  ',' ')

                # print(line_count)
                # print(line[0], line[-1])

                if line == "end credits":
                    break
                
                if '♪' in line:
                    pass
                
                elif len(line) > 1 and (line[0] != '(' and line[-1] != ')') and (line[0] != '[' and line[-1] != ']'):
                    # print(line)
                    linesplit = line.split(': ', maxsplit=1)
                    # print(line.split(': ', maxsplit=1))
                    if len(linesplit) > 1:
                        speaker, line_contents = linesplit
                        data_dict[season][episode_num][line_count] = {'line':line_contents, 'speaker':speaker, 
                                                                  'episode':episode_num, 'scene_count':scene_count, 
                                                                  'line_count':line_count, 'season':season}
                    else:
                        # Line without speaker in front
                        pass
                    
                elif "perry" in line and "chatter" in line:
                    data_dict[season][episode_num][line_count] = {'line':line[1:-1], 'speaker':'perry', 
                                                                  'episode':episode_num, 'scene_count':scene_count,
                                                                  'line_count':line_count, 'season':season}
                else:
                    scene_count += 1
                line_count += 1

output_filename = 'temp.csv'
with open(output_filename, 'w', newline='') as csvfile:
    fieldnames = ['speaker', 'line', 'season', 'episode', 'scene_count', 'line_count']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    alllines = []
    for season in seasons:
        for episode in data_dict[season].keys():

            for line in data_dict[season][episode].keys():
                alllines.append(data_dict[season][episode][line])
    writer.writerows(alllines)

print(f"Data written to {output_filename}.")

# print(data_dict)


