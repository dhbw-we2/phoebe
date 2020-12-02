import {date} from "quasar";
import {firestore} from "firebase/app";

export function getTimeSincePostText(startTime, finishTime) {
  if (startTime instanceof firestore.Timestamp) startTime = startTime.toMillis()
  if (finishTime instanceof firestore.Timestamp) finishTime = finishTime.toMillis()

  let unit = "";
  let result = finishTime - startTime;

  // Why i used ifs https://stackoverflow.com/questions/6665997/switch-statement-for-greater-than-less-than
  if (result < 60000) unit = 'seconds';
  else if (result < 3600000) unit = 'minutes';
  else if (result < 86400000) unit = 'hours';
  else if (result < 2592000000) unit = 'days';
  else if (result < 31536000000) unit = 'months';
  else if (result >= 31536000000) unit = 'years';

  if(result < 10000 && result > -10000)
    return 'just now'
  else {
    const timeDiffStr = `${date.getDateDiff(finishTime, startTime, unit)} ${unit}`
    if(result > 0)
      return `${timeDiffStr} ago`
    else
      return `in ${timeDiffStr}`
  }
}
