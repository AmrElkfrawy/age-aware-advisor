function convertToAgeGroup(result) {
  if (result[0].label === 'more than 70') return 'more than 70';
  if (result[0].label == '3-9') return 'Kid';

  const threshold = 0.3;
  let ageGroup;
  let ageGroupDescription;

  if (result[0].score - result[1].score >= threshold)
    ageGroupDescription = 'Middle';
  else {
    if (result[0].label == '10-19' && result[1].label == '3-9')
      ageGroupDescription = 'Early';
    else if (result[0].label == '60-69' && result[1].label == 'more than 70')
      ageGroupDescription = 'Late';
    else if (parseInt(result[0].label[0]) < parseInt(result[1].label[0]))
      ageGroupDescription = 'Late';
    else if (parseInt(result[0].label[0]) > parseInt(result[1].label[0])) {
      ageGroupDescription = 'Early';
    }
  }

  if (result[0].label == '10-19') ageGroup = 'teenager';
  else if (result[0].label == '20-29') ageGroup = '20s';
  else if (result[0].label == '30-39') ageGroup = '30s';
  else if (result[0].label == '40-49') ageGroup = '40s';
  else if (result[0].label == '50-59') ageGroup = '50s';
  else if (result[0].label == '60-69') ageGroup = '60s';

  return `${ageGroupDescription} ${ageGroup}`;
}
module.exports = convertToAgeGroup;
