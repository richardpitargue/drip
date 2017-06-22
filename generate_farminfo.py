import sys
from requests import get, post
from datetime import datetime,timedelta

opts = sys.argv[1:]

farmId = opts[0]
stationId = opts[1]
day = opts[2]
month = opts[3]
year = opts[4]
gdd_at_maturity = opts[5]
cropId = opts[6]

now = datetime.now().date()
current_date = datetime(int(year), int(month), int(day)).date()

# initialize values
water_deficit = 0
cumulative_gdd = 0
maturity = 0

crop_info = get('http://http://159.203.253.4:3000/api/crop/{id}'.format(id=cropId)).json()

def compute_kc(maturity):
    if maturity < crop_info['cutoff'][0]:
        return crop_info['cropCoefficient'][0]

    if maturity < crop_info['cutoff'][1]:
        return ((crop_info['cropCoefficient'][0] + (crop_info['cropCoefficient'][1] - crop_info['cropCoefficient'][0]) / (crop_info['cutoff'][1] - crop_info['cutoff'][0])) * (maturity - crop_info['cutoff'][0]))
    else:
        if maturity > crop_info['cutoff'][2]:
            return (crop_info['cropCoefficient'][1] - ((crop_info['cropCoefficient'][1] - crop_info['cropCoefficient'][w]) / (100 - crop_info['cutoff'][2])) * (maturity - crop_info['cutoff'][2]))
        else:
            return crop_info['cropCoefficient'][2]

post_result = post('http://localhost:3000/api/farm/info', data={
    'farmId': farmId,
    'day': day,
    'month': month,
    'year': year,
    'waterDeficit': water_deficit,
    'irrigation': 0,
    'gdd': 0,
    'cumulativeGdd': cumulative_gdd,
    'maturity': maturity
})

current_date = current_date + timedelta(days=1)

while current_date < now:
    result = get('http://localhost:3001/data/{id}/waterdeficit/{d}-{m}-{y}'.format(id=stationId, d=current_date.day, m=current_date.month, y=current_date.year))
    data = result.json()

    gdd = data['temp']['ave'] - 10
    cumulative_gdd = cumulative_gdd + gdd
    maturity = cumulative_gdd / float(gdd_at_maturity) * 100
    ETa = data['ET']['ave'] * compute_kc(maturity)
    water_deficit = ETa - data['rainfall']['ave'] + water_deficit

    post('http://localhost:3000/api/farm/info', data={
        'farmId': farmId,
        'day': current_date.day,
        'month': current_date.month,
        'year': current_date.year,
        'waterDeficit': water_deficit,
        'irrigation': 0,
        'gdd': gdd,
        'cumulativeGdd': cumulative_gdd,
        'maturity': maturity
    })

    current_date = current_date + timedelta(days=1)
