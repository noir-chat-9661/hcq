import { jobs, options } from '@/constants';

const useCalc = () => (skillPoints, charaData) => {
	const status = {...jobs[charaData.characterType].status[0]};
	status.SP = 1000;
	Object.entries(jobs[charaData.characterType].status[1]).forEach(d => status[d[0]] += Math.floor(d[1] * charaData.charalevel));
	let points = [...skillPoints]
	if (points.reduce((a, b) => a + b, 0) < charaData.charalevel + 4) {
		points = points.map((p, i) => {
			if ((charaData.remain == -1 && i === charaData.characterType) || (charaData.remain != -1 && i === charaData.remain)) {
				return p + (charaData.charalevel + 4 - points.reduce((a, b) => a + b, 0));
			}
			return p;
		})
	}
	jobs.map(j => j.status[2]).forEach((d, i) => 
		Object.entries(d).forEach(s => status[s[0]] += Math.floor(s[1] * points[i]))
	);

	if (charaData.characterType == 0 && charaData.hiden == 3) {
		status.as += 5
	} else if (charaData.characterType == 3 && charaData.hiden == 1) {
		status.ms += 3
	} else if (charaData.characterType == 5 && charaData.hiden == 1) {
		status.as += 3
	} else if (charaData.characterType == 6 && charaData.hiden == 1) {
		status.SP += 400
	}

	switch (charaData.weapon) {
		case 38:
			status.SP += 1000;
			status.def += 100;
			break;
		case 39:
			status.pow += 100;
			break;
		case 40:
			status.tec += 100;
			status.SP += 300;
			break;
		case 41:
			status.def += 100;
			status.SP += 500;
			break;
		case 42:
			status.ms += 10;
			break;
		case 43:
			status.tec -= 200;
			break;
		case 44:
			status.ms += 3;
			status.as += 6;
			break;
		case 45:
			status.tec += 100;
			status.SP -= 200;
			break;
		case 46:
			status.tec += 100;
			status.SP += 500;
			break;
	}

	if (charaData.weapon != -1) {
		for (let i = 0; i < 3; i++) {
			const option = options[0].find(o => o.id === charaData[`weaponOption${i}`])
			if (option.addstatus) option.addstatus.forEach(s => {
				status[s.type] += s.value;
			});
		}			
	}
	for (let i = 3; i < 6; i++) {
		if (charaData[`weaponOption${i}`] === -1) continue;
		const option = options[Math.floor(i / 3)].find(o => o.id === charaData[`weaponOption${i}`])
		if (option.addstatus) option.addstatus.forEach(s => {
			status[s.type] += s.value;
		})
	}
	status.pow += charaData.bonusPow;
	status.def += charaData.bonusDef;
	status.tec += charaData.bonusTec;
	if (charaData.weapon != -1) {
		status.pow = Math.floor(status.pow * (1 + (charaData.weaponPow + charaData.weaponPowPlus) / 100));
		status.def = Math.floor(status.def * (1 + (charaData.weaponDef + charaData.weaponDefPlus) / 100));
		status.tec = Math.floor(status.tec * (1 + (charaData.weaponTec + charaData.weaponTecPlus) / 100));
	}

	status.HP += Math.floor(status.def / 10);

	if (status.pow < 0) status.pow = 1;
	if (status.def < 0) status.def = 1;
	if (status.tec < 0) status.tec = 1;
	return status;
}

export { useCalc };
