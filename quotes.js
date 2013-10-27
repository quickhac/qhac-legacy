function get_random_inspiring_quote() {
	var $root = $(document.createDocumentFragment());
	var quote = INSPIRING_QUOTES[parseInt(Math.random() * INSPIRING_QUOTES.length)];
	// $root.append("\"" + quote.text + "\" &mdash; ");
	quote.text.replace("'", "&apos;");
	var $q = $(document.createElement("q"));
	$q.html(quote.text);
	$root.append($q);
	var $cite = $(document.createElement("cite"));
	if (quote.hasOwnProperty("link")) {
		var $link = $(document.createElement("a"));
		$link.prop("href", quote.link).text(quote.source);
		$cite.append($link);
	} else {
		$cite.text(quote.source);
	}
	$root.append($cite);
	return $root;
}

var INSPIRING_QUOTES = [
	{
		text: "Study: The act of texting, eating, and watching TV with an open textbook nearby.",
		source: "the-mind-of-mia-moreno",
	},
	{
		text: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.",
		source: "Albert Einstein",
	},
	{
		text: "Those who don't know history are doomed to repeat it.",
		source: "Edmund Burke",
	},
	{
		text: "The authority of those who teach is often an obstacle to those who want to learn.",
		source: "Cicero",
	},
	{
		text: "Instruction does much, but encouragement everything.",
		source: "Goethe",
	},
	{
		text: "Teaching is not a lost art, but the regard for it is a lost tradition.",
		source: "Jacques Barzun",
	},
	{
		text: "Imagination is more important than knowledge. Knowledge is limited; imagination encircles the world.",
		source: "Albert Einstein",
	},
	{
		text: "The difference between school and life? In school, you're taught a lesson and then given a test. In life, you're given a test that teaches you a lesson.",
		source: "Tom Bodett",
	},
	{
		text: "Public education was not founded to give society what it wants. Quite the opposite.",
		source: "May Sarton",
	},
	{
		text: "School prepares you for the real world... which also bites.",
		source: "Jim Benton",
	},
	{
		text: "School made us 'literate' but did not teach us to read for pleasure.",
		source: "Ambeth R. Ocampo",
	},
	{
		text: "A teacher is one who makes himself progresively unnecessary.",
		source: "Thomas Carruthers",
	},
	{
		text: "You will ever remember that all the end of study is to make you a good man and a useful citizen.",
		source: "John Adams",
	},
	{
		text: "You can't eat straight A's.",
		source: "Maxine Hong Kingston",
	},
	{
		text: "The philosophy of the schoolroom in one generation is the philosophy of government in the next.",
		source: "Abraham Lincoln",
	},
	{
		text: "As you can see, there are quite a number of things taught in school that one has to unlearn or at least correct.",
		source: "Ambeth R. Ocampo",
	},
	{
		text: "There's always a bit of suspense about the particular way in which a given school year will get off to a bad start.",
		source: "Frank Portman",
	},
	{
		text: "There's no crying in the rank book.",
		source: "William Morton",
	},
	{
		text: "It's much easier on the emotions when one sees life as an experiment rather than a struggle for popularity.",
		source: "Criss Jami",
	},
	{
		text: "thnkz 4 hlpng e wth e spllng d gwammer mestr josef",
		source: "Ward Schiller",
	},
	{
		text: "Don't ask what your school can do for you, ask what you can do for your school.",
		source: "Josh Zigal",
	},
	{
		text: "A good education helps us make sense of the world and find our way in it.",
		source: "Mike Rose",
	},
	{
		text: "A witty quote proves nothing.",
		source: "Voltaire",
	},
	{
		text: "By doing nothing, you become nothing.",
		source: "unknown",
	},
	{
		text: "Mastering others is strength; mastering yourself is true power.",
		source: "Lao Tzu",
	},
	{
		text: "I want to put a ding in the universe.",
		source: "Steve Jobs",
	},
	{
		text: "Sometimes life hits you in the head with a brick. Don't lose faith.",
		source: "Steve Jobs",
	},
	{
		text: "If tomorrow ain't the due date, today ain't the do date.",
		source: "Freya"
	},
	{
		text: "Knowledge is having the right answer. Intelligence is asking the right question.",
		source: "unknown"
	},
	{
		text: "Many of life's failures are people who didn't realize how close they were to success when they gave up.",
		source: "Thomas Edison"
	},
	{
		text: "A creative man is motivated by the desire to achieve, not by the desire to beat others.",
		source: "Ayn Rand"
	},
	{
		text: "Be so good they can't ignore you.",
		source: "Steve Martin"
	},
	{
		text: "Hard work beats talent when talent doesn't work hard.",
		source: "Tim Notke"
	},
	{
		text: "Your future is created by what you do today, not tomorrow.",
		source: "Robert Kiyosaki"
	}
];
