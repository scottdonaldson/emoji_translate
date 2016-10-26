import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';
import emoji from '../../../data/dictionary.json';

// emoji:

// emoji.lib 		{ name: {}, ... }
// emoji.ordered	[ name, ... ]

/* emoji.chars = {};
emoji.categories = {};
emoji.keywords = {}; */

function validateChar(c) {
	return emoji.chars.hasOwnProperty(c);
}

function getEmojiName(c) {
	return emoji.chars[c].name;
}

function indefiniteArticle(c) {
	
	var obj = emoji.chars[c];
	
	if ( obj.plural ) {
		return '';
	} else {
		if ( ['a','e','i','o','u'].indexOf(getEmojiName(c)[0]) > -1 ) {
			return 'an ';
		} else {
			return 'a ';
		}
	}
}

function isPlural(c) {
	return emoji.chars[c].hasOwnProperty('plural') ? emoji.chars[c].plural : false;
}

function makePlural(c) {
	if ( emoji.chars[c].hasOwnProperty('plural') ) return getEmojiName(c);
	return emoji.chars[c].hasOwnProperty('plural_name') ? emoji.chars[c].plural_name : getEmojiName(c) + 's';
}

class MainComponent extends React.Component {

	constructor() {
		super();

		this.state = {
			text: '',
			codes: [],
			translation: ''
		};

		/*
		for ( var name in emoji.lib ) {

			let obj = emoji.lib[name];
			let c = obj.char;
			
			if ( c && c.length > 0 ) {
				c = c.codePointAt(0);
			} else {
				break;
			}

			if ( !emoji.chars.hasOwnProperty(c) ) {
				emoji.chars[c] = {
					keywords: obj.keywords,
					category: obj.category,
					name
				};
			}
			
			if ( obj.category ) {
				if ( !emoji.categories.hasOwnProperty(obj.category) ) {
					emoji.categories[obj.category] = [];
				}
				emoji.categories[obj.category].push(c);
			}
			
			if ( obj.keywords && obj.keywords.length > 0 ) {
				obj.keywords.forEach(function(keyword) {
					if ( !emoji.keywords.hasOwnProperty(keyword) ) {
						emoji.keywords[keyword] = [];
					}
					emoji.keywords[keyword].push(c);
				});
			}
		}
		*/
	}

	componentDidMount() {
	}

	buildSentence(text, start, end)
	//@requires start >= 0 && start < end && end <= text.length;
	{
		var sentence = '';
		
		sentence += 'The ';

		if ( end - start === 1 ) {

			sentence += getEmojiName(text[start]);

		} else if ( end - start === 2 ) {

			var a = text[start],
				b = text[start + 1];

			sentence += getEmojiName(a) + ' ';
			sentence += isPlural(a) ? 'are ' : 'is ' + indefiniteArticle(b);
			sentence += getEmojiName(b);

		} else if ( end - start === 3 ) {
			sentence += getEmojiName(text[start]) + ' ';
			sentence += 'and ';
			sentence += getEmojiName(text[start + 1]) + ' ';
			sentence += 'are ';
			sentence += makePlural(text[start + 2]);
		}

		sentence += '.';

		// console.log(sentence);

		return sentence;
	}

	translate() {
		
		var codes = [],
			length = 0,
			translation = '',
			i = 0;

		// remove invalid characters
		while ( i < this.state.text.length ) {
			var c = this.state.text.codePointAt(i);
			if ( validateChar(c) ) {
				codes.push(c);
				length = codes.length;
			}
			i++;
		}

		// reset
		i = 0;

		if ( length === 0 ) return this.setState({ translation });

		if ( length < 2 ) {
			return this.setState({ 
				translation: this.buildSentence(codes, i, 1)
			});
		}

		while ( i < length ) {

			// bias toward 2-word sentences
			var end = i + 2;
			
			// if we're close to the end, build a 3-word sentence
			if ( length - i === 3 ) end = i + 3;

			translation += this.buildSentence(codes, i, end) + ' ';
			
			i = end;
		}

		return this.setState({ 
			translation,
			codes
		});
	}

	change(e) {
		// set the state and pass it along to be translated
		this.setState({ text: e.target.value }, this.translate.bind(this));
	}
	
	render() {

		let style = {
		};

		return (
			<div style={style}>
				<textarea onChange={this.change.bind(this)} className="textarea" />
				<textarea className="textarea" value={this.state.translation} />
			</div>
		);
	}

}

export default MainComponent;
