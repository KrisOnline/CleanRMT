"use strict";

const dex = require('./data/dex.js');
const megas = require('./data/megas.js');
const baseImage = require('./data/base-image.js');

const formats = {
	"icons": ["https://www.serebii.net/pokedex-sm/icon/", ".png", "iconserebii"],
	"shuffle": ["http://www.pkparaiso.com/imagenes/shuffle/sprites/", ".png", "paraiso"],
	"xyanimated": ["http://play.pokemonshowdown.com/sprites/xyani/", ".gif"],
	"xy": ["http://play.pokemonshowdown.com/sprites/xy/", ".png"],
	"smd": ["http://www.serebii.net/supermysterydungeon/pokemon/", ".png", "serebii"],
};

function hash(pokemon, format) {//gets dex number
	pokemon = pokemon[0].toUpperCase() + pokemon.substr(1);
	if (dex[pokemon]) return dex[pokemon][0];
	if (format === "iconserebii") {
		if (pokemon === "Charizard-MegaX") dex[pokemon][0] = "006-mx";
		if (pokemon === "Charizard-MegaY") dex[pokemon][0] = "006-my";
		if (pokemon === "Mewtwo-MegaX") dex[pokemon][0] = "150-mx";
		if (pokemon === "Mewtwo-MegaY") dex[pokemon][0] = "150-my";
		if (pokemon === "Deoxys-Attack") dex[pokemon][0] = "386a";
		if (pokemon === "Deoxys-Defense") dex[pokemon][0] = "386d";
		if (pokemon === "Deoxys-Speed") dex[pokemon][0] = "386s";
		if (pokemon === "Rotom-Fan") dex[pokemon][0] = "479s";
		if (pokemon === "Rotom-Frost") dex[pokemon][0] = "479f";
		if (pokemon === "Rotom-Heat") dex[pokemon][0] = "479h";
		if (pokemon === "Rotom-Mow") dex[pokemon][0] = "479m";
		if (pokemon === "Rotom-Wash") dex[pokemon][0] = "479w";
		if (pokemon === "Giratina-Origin") dex[pokemon][0] = "487o";
		if (pokemon === "Shaymin-Sky") dex[pokemon][0] = "492s";
		if (pokemon === "Basculin-BlueStriped") dex[pokemon][0] = "550-b";
		if (pokemon === "Darmanitan-Zen") dex[pokemon][0] = "555d";
		if (pokemon === "Oricorio-PomPom") dex[pokemon][0] = "741-p";
		if (pokemon === "Oricorio-Pau") dex[pokemon][0] = "741-pau";
		if (pokemon === "TypeNull") dex[pokemon][0] = "772";
		if (pokemon === "Jangmoo") dex[pokemon][0] = "782";
		if (pokemon === "Hakamoo") dex[pokemon][0] = "783";
		if (pokemon === "Kommoo") dex[pokemon][0] = "784";
		if (pokemon === "Necrozma-DuskMane") dex[pokemon][0] = "800-dm";
		if (pokemon === "Necrozma-DawnWings") dex[pokemon][0] = "800-dw";
	}
	if (format === "paraiso" && ~pokemon.indexOf("mega")) dex[pokemon][0] += "ega";
	return pokemon;
}

function removeParenthesizedInfo(line) {
	if (!~line.indexOf('(')) return line.trim();
	let start = line.indexOf('(') + 1;
	let len = line.lastIndexOf(')') - start;
	line = line.substr(start, len).trim();
	return line;
}

function checkMega(line) {
	let pokemon = line[0].toLowerCase();
	if (!line[1]) return line[0]; //no item, its not mega
	let item = line[1].toLowerCase().trim();
	if (!megas[pokemon]) return line[0];
	if (megas[pokemon]) {
		if (typeof (megas[pokemon]) !== "object" && megas[pokemon] === item) {
			return line[0] + '-Mega';
		} else if (typeof (megas[pokemon]) === "object") {
			if (megas[pokemon][0] === item) return line[0] + '-Mega-X';
			else if (megas[pokemon][1] === item) return line[0] + '-Mega-Y';
		} else {
			return line[0];
		}
	}
}

function packTeam(importable) {
	let team = {
		"pokemon": [],
		"pokenames": [],
		"items": [],
		"evs": [],
		"abilities": [],
		"natures": [],
		"moves": [],
		"ivs": [],
	};
	team.importable = importable;
	let lines = importable.split('\n');
	let data = [];
	let dataIndex = 0;
	data.push([lines[0]]);
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].length < 2) continue;
		if (lines[i - 1].length < 2) {
			dataIndex++;
			data.push([lines[i]]);
		} else {
			data[dataIndex].push(lines[i].trim());
		}
	}
	for (let j = 0; j < data.length; j++) {
		for (let k = 0; k < data[j].length; k++) {
			let l = data[j][k];
			if (k === 0) {
				let pokeno = team.pokemon.length;
				if (pokeno > team.evs.length) team.evs.push("No EVs");
				if (pokeno > team.abilities.length) team.abilities.push("No Ability");
				if (pokeno > team.natures.length) team.natures.push("No Nature");
				if (pokeno > team.ivs.length) team.ivs.push(false);
				let line = l.split(" @ ");
				team.pokenames.push(line[0]);
				line[0] = removeParenthesizedInfo(line[0]);
				team.pokemon.push(checkMega(line));
				/* eslint-disable */
				line[1] ? team.items.push(line[1].trim()) : team.items.push(false);
				/* eslint-enable */
			} else if (~l.indexOf("EVs: ")) {
				team.evs.push(l.substr(l.indexOf(' ')).trim());
			} else if (~l.indexOf("Ability: ")) {
				team.abilities.push(l.substr(l.indexOf(' ')).trim());
			} else if (~l.indexOf("IVs: ")) {
				team.ivs.push(l.substr(l.indexOf(' ')).trim());
			} else if (~l.indexOf("Nature")) {
				team.natures.push(l.substr(0, l.indexOf(' ')).trim());
			} else if (~l.indexOf("- ")) {
				let pokeno = team.pokemon.length - 1;
				if (team.moves[pokeno]) {
					team.moves[pokeno].push(l.substr(l.indexOf(" ")).trim());
				} else {
					team.moves.push([l.substr(l.indexOf(" ")).trim()]);
				}
			}
		}
	}
	let pokeno = team.pokemon.length;
	if (pokeno > team.evs.length) team.evs.push("No EVs");
	if (pokeno > team.abilities.length) team.abilities.push("No Ability");
	if (pokeno > team.natures.length) team.natures.push("No Nature");
	if (pokeno > team.ivs.length) team.ivs.push(false);
	return team;
}

function getImgs(format, team) {
	let output = "";
	if (typeof (team) !== "object") team = packTeam(team);
	let pokemon = team.pokemon;
	for (let j = 0; j < pokemon.length; j++) {
		output += getImg(format, pokemon[j].toLowerCase());
	}
	return output;
}

function getImg(format, pokemon) {
	if (!formats[format]) return;
	if (pokemon === "mime jr.") pokemon = "mimejr";
	if (pokemon === "charizard-mega-x") pokemon = "charizard-megax";
	if (pokemon === "charizard-mega-y") pokemon = "charizard-megay";
	if (pokemon === "raticate-alola-totem") pokemon = "raticate-alola";
	if (["pikachu-pop-star", "pikachu-phd", "pikachu-rock-star", "pikachu-libre"].includes(pokemon)) pokemon = "pikachu-cosplay";
	if (pokemon === "marowak-alola-totem") pokemon = "marowak-alola";
	if (pokemon === "mewtwo-mega-x") pokemon = "mewtwo-megax";
	if (pokemon === "mewtwo-mega-y") pokemon = "mewtwo-megay";
	if (pokemon === "basculin-blue-striped") pokemon = "basculin-bluestriped";
	if (pokemon === "meowstic-f") pokemon = "meowsticf";
	if (pokemon === "zygarde-10%") pokemon = "zygarde-10";
	if (pokemon === "gumshoos-totem") pokemon = "gumshoos";
	if (pokemon === "vikavolt-totem") pokemon = "totem";
	if (pokemon === "oricorio-pom-pom") pokemon = "oricorio-pompom";
	if (pokemon === "oricorio-pa'u") pokemon = "oricorio-pau";
	if (pokemon === "ribombee-totem") pokemon = "ribombee";
	if (pokemon === "araquanid-totem") pokemon = "araquanid";
	if (pokemon === "lurantis-totem") pokemon = "lurantis";
	if (pokemon === "salazzle-totem") pokemon = "salazzle";
	if (pokemon === "type: null") pokemon = "typenull";
	if (pokemon === "togedemaru-totem") pokemon = "togedemaru";
	if (pokemon === "mimikyu-totem") pokemon = "mimikyu";
	if (pokemon === "mimikyu-busted-totem") pokemon = "mimikyu-busted";
	if (pokemon === "jangmo-o") pokemon = "jangmoo";
	if (pokemon === "salazzle-totem") pokemon = "hakamoo";
	if (pokemon === "kommo-o") pokemon = "kommoo";
	if (pokemon === "kommo-o-totem") pokemon = "kommoo";
	if (pokemon === "necrozma-dusk-mane") pokemon = "necrozma-duskmane";
	if (pokemon === "necrozma-dawn-wings") pokemon = "necrozma-dawnwings";
	// if (baseImage[pokemon]) format = 'xyanimated';
	let fdata = formats[format];
	return '[img]' + fdata[0] + (fdata[2] ? hash(pokemon, fdata[2]) : pokemon.toLowerCase()) + fdata[1] + '[/img]';
}

function toTitle(text, options) { //This function is a disaster lol
	let output = "[" + options.align + "][FONT=" + options.tfont + "][SIZE=" + options.size + "]";
	if (options.bold) output += "[B]";
	if (options.underlined) output += "[U]";
	if (options.bold === "first") text = text[0] + "[/B]" + text.substr(1);
	output += text;
	if (options.bold && options.bold !== "first") output += "[/B]";
	if (options.underlined) output += "[/U]";
	output += "[/SIZE][/FONT][/" + options.align + "]";
	return output;
}

function buildingProcess(format, pokemon, f, fe) {
	let output = ["", "", "", "", "", ""];
	for (let i = 0; i < pokemon.length; i++) {
		let img = getImg(format, pokemon[i].toLowerCase());
		for (let j = i; j < pokemon.length; j++) {
			output[j] += img;
		}
	}
	for (let k = 0; k < output.length; k++) {
		output[k] += "\n" + f + "**Why did you choose this pokemon?**" + fe + "\n";
	}
	return output.join("");
}
/* eslint-disable */
function buildSets(data, options, f, fe) {
	let output = "";
	switch (options.setFormat) {
	case 'importable': //default
		for (let i = 0; i < data.pokemon.length; i++) {
			output += "[" + options. align + "]" + getImg(options.imgFormat, data.pokemon[i].toLowerCase()) + "\n" +
				data.pokenames[i] + " @ " + data.items[i] + "\n" +
				"Ability: " + data.abilities[i] + "\n" +
				"EVs: " + data.evs[i] + "\n" +
				data.natures[i] + " Nature \n" +
				(data.ivs[i] ? "IVs: " + data.ivs[i] + "\n" : "");
			for (let k = 0; k < data.moves[i].length; k++) {
				output += "- " + data.moves[i][k] + "\n";
			}
		output += "[/" + options.align + "]\n" + f + "" + f + "**Why did you choose this pokemon? What does it do for your team?**" + fe + "" + fe + "\n\n";
		}
	break;
	case 'bold-importable': //default with bold
		for (let i = 0; i < data.pokemon.length; i++) {
			output += "[LEFT]" + getImg(options.imgFormat, data.pokemon[i].toLowerCase()) + "\n" +
				"[B]" + data.pokenames[i] + "[/B]" + (data.items[i] ? " @ " + data.items[i] : "") + "\n" +
				"[B]Ability:[/B] " + data.abilities[i] + "\n" +
				"[B]Nature:[/B] " + data.natures[i] + "\n" +
				"[B]EVs:[/B] " + data.evs[i] + "\n" +
				(data.ivs[i] ? "[B]IVs:[/B] " + data.ivs[i] + "\n" : "") +
				"[B]Moves:[/B] ";
			for (let k = 0; k < data.moves[i].length; k++) {
				if (k !== 0) output += " | ";
				output += data.moves[i][k];
			}
		output += "[/LEFT]\n\n" + f + "**Why did you choose this pokemon? What does it do for your team?**" + fe + "\n\n";
		}
	break;
	case 'alternative': //trinitrotoluene
		for (let i = 0; i < data.pokemon.length; i++) {
			output += "[B][SIZE=2][LEFT][INDENT]" + getImg(options.imgFormat, data.pokemon[i].toLowerCase()) + "[/INDENT]\n" +
				data.pokenames[i] + (data.items[i] ? " @ " + data.items[i] : "") + " | " +
				data.abilities[i] + "\n" +
				data.natures[i] + " | " +
				data.evs[i] + "\n" +
				(data.ivs[i] ? "IVs: " + data.ivs[i] + "\n" : "");
			for (let k = 0; k < data.moves[i].length; k++) {
				output += "• " + data.moves[i][k] + "\n";
			}
		output += "[/B][/SIZE][/LEFT]" + f + "**Why did you choose this pokemon? What does it do for your team?**" + fe + "\n\n";
		}
	break;
	case 'pearl': //Pearl
		for (let i = 0; i < data.pokemon.length; i++) {
			output += "[SIZE=2][CENTER]" + getImg(options.imgFormat, data.pokemon[i].toLowerCase()) + "\n" +
				(data.items[i] ?
					"@ [IMG]http://www.serebii.net/itemdex/sprites/" + data.items[i].toLowerCase().split(" ").join("") + ".png[/IMG]\n" :
					"") +
				"[B]Ability-[/B] " + data.abilities[i] + "\n" +
				"[B]EVs-[/B] " + data.evs[i].split(' / ').join(' | ') + "\n" +
				(data.ivs[i] ? "[B]IVs-[/B] " + data.ivs[i] + "\n" : "") +
				"[B]Nature- [/B]" + data.natures[i] + "\n\n";
			for (let k = 0; k < data.moves[i].length; k++) {
				if (k !== 0) output+= " | ";
				output += data.moves[i][k];
			}
		output += "[/SIZE][/CENTER]\n" + f + "**Why did you choose this pokemon? What does it do for your team?**" + fe + "\n\n";
		}
	break;
	}
	return output;
}
/* eslint-enable */

function rmt(team, options) {
	let data = packTeam(team);
	options.align = options.align.toUpperCase(); //easier than doing this client-side
	options.size = parseInt(options.size);
	options.process = options.process === 'true';
	options.bold = options.bold === 'true';
	options.underlined = options.underlined === 'true';
	let f = "[FONT=" + options.font + "]";
	let fe = "[/FONT]";
	let output = "";
	output += "[center]" + getImgs(options.imgFormat, data) + "[/center]\n\n" +
		toTitle("Introduction", options) + "\n\n" + f + "**Introduction goes here**" + fe + "\n\n";
	if (options.process) {
		output += toTitle("Teambuilding Process", options) + "\n\n" +
			"[hide]" + buildingProcess(options.processFormat, data.pokemon, f, fe) + "[/hide]\n" +
			"\n" + toTitle("The Team", options) + "\n\n";
	}
	output += buildSets(data, options, f, fe);
	output += toTitle("Conclusion", options) + "\n\n" + f + "**Conclusion goes here**" + fe + "\n\n" +
		"[hide=Importable]" + data.importable + "[/hide]";
	return output;
}

module.exports.rmt = rmt;
module.exports.getImgs = getImgs;
