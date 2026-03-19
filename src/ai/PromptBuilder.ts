import { Character } from '../entities/Character';
import { TimeSystem } from '../systems/TimeSystem';

export class PromptBuilder {
  buildBatchPrompt(characters: Character[], time: TimeSystem): string {
    const timeStr = time.getTimeString();
    const phase = time.getDayPhase();

    const charDescriptions = characters.map(c => ({
      name: c.name,
      role: c.role,
      currentState: c.state,
      location: c.currentLocationId,
    }));

    return `You are the AI director of a peaceful village simulation. It is currently ${timeStr} (${phase}).

Here are the villagers who need decisions:
${JSON.stringify(charDescriptions, null, 2)}

Available locations: square, well, house1_door through house6_door, barn, field_north, field_south, bridge_west, bridge_east, east_bank, east_forest.

For each villager, decide what they should do next. Consider:
- Time of day (dawn=wake up, morning=work, afternoon=eat/work, dusk=socialize, night=sleep)
- Their role (farmers work fields, craftsmen work at barn, elders socialize, children play)
- Natural variety - not everyone does the same thing

Respond with a JSON array of decisions:
[
  {
    "name": "villager name",
    "action": "idle" | "walking" | "working" | "eating" | "sleeping" | "socializing",
    "targetLocation": "location_id or null",
    "reason": "brief reason for this decision"
  }
]`;
  }
}
