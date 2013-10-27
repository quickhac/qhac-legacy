function get_random_inspiring_quote() {
	var $root = $(document.createDocumentFragment());
	var quote = INSPIRING_QUOTES[parseInt(Math.random() * INSPIRING_QUOTES.length)];
	$root.append("\"" + quote.text + "\" &mdash; ");
	var $link = $(document.createElement("a"));
	$link.attr("href",quote.link).text(quote.source);
	$root.append($link);
	return $root;
}

var INSPIRING_QUOTES = [
	{
		text: "Study: The act of texting, eating, and watching TV with an open textbook nearby.",
		source: "the-mind-of-mia-moreno",
		link: "http://the-mind-of-mia-moreno.tumblr.com/"
	},
	{
		text: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.",
		source: "Albert Einstein",
		link: "http://www.goodreads.com/author/show/9810.Albert_Einstein"
	},
	{
		text: "Those who don't know history are doomed to repeat it.",
		source: "Edmund Burke",
		link: "http://www.goodreads.com/author/show/17142.Edmund_Burke"
	},
	{
		text: "The authority of those who teach is often an obstacle to those who want to learn.",
		source: "Cicero",
		link: "http://www.goodreads.com/author/show/13755.Cicero"
	},
	{
		text: "Instruction does much, but encouragement everything.",
		source: "Goethe",
		link: "http://www.goodreads.com/author/show/285217.Johann_Wolfgang_von_Goethe"
	},
	{
		text: "Teaching is not a lost art, but the regard for it is a lost tradition.",
		source: "Jacques Barzun",
		link: "http://www.goodreads.com/author/show/16173.Jacques_Barzun"
	},
	{
		text: "Imagination is more important than knowledge. Knowledge is limited; imagination encircles the world.",
		source: "Albert Einstein",
		link: "http://wallbase.cc/wallpaper/724965"
	},
	{
		text: "The difference between school and life? In school, you're taught a lesson and then given a test. In life, you're given a test that teaches you a lesson.",
		source: "Tom Bodett",
		link: "http://www.goodreads.com/author/show/58627.Tom_Bodett"
	},
	{
		text: "Public education was not founded to give society what it wants. Quite the opposite.",
		source: "May Sarton",
		link: "http://www.goodreads.com/author/show/13166.May_Sarton"
	},
	{
		text: "School prepares you for the real world... which also bites.",
		source: "Jim Benton",
		link: "http://www.goodreads.com/author/show/26839.Jim_Benton"
	},
	{
		text: "School made us 'literate' but did not teach us to read for pleasure.",
		source: "Ambeth R. Ocampo",
		link: "http://www.goodreads.com/author/show/90094.Ambeth_R_Ocampo"
	},
	{
		text: "A teacher is one who makes himself progresively unnecessary.",
		source: "Thomas Carruthers",
		link: "http://www.goodreads.com/quotes/tag/school"
	},
	{
		text: "You will ever remember that all the end of study is to make you a good man and a useful citizen.",
		source: "John Adams",
		link: "http://www.goodreads.com/author/show/1480.John_Adams"
	},
	{
		text: "You can't eat straight A's.",
		source: "Maxine Hong Kingston",
		link: "http://www.goodreads.com/author/show/17290.Maxine_Hong_Kingston"
	},
	{
		text: "The philosophy of the schoolroom in one generation is the philosophy of government in the next.",
		source: "Abraham Lincoln",
		link: "http://www.goodreads.com/author/show/229.Abraham_Lincoln"
	},
	{
		text: "As you can see, there are quite a number of things taught in school that one has to unlearn or at least correct.",
		source: "Ambeth R. Ocampo",
		link: "http://www.goodreads.com/author/show/90094.Ambeth_R_Ocampo"
	},
	{
		text: "There's always a bit of suspense about the particular way in which a given school year will get off to a bad start.",
		source: "Frank Portman",
		link: "http://www.goodreads.com/author/show/6931.Frank_Portman"
	},
	{
		text: "There's no crying in the rank book.",
		source: "William Morton",
		link: "http://www.goodreads.com/author/show/3361911.William_Morton"
	},
	{
		text: "It's much easier on the emotions when one sees life as an experiment rather than a struggle for popularity.",
		source: "Criss Jami",
		link: "http://www.goodreads.com/author/show/4860176.Criss_Jami"
	},
	{
		text: "thnkz 4 hlpng e wth e spllng d gwammer mestr josef",
		source: "Ward Schiller",
		link: "http://www.goodreads.com/author/show/5766926.ward_schiller"
	},
	{
		text: "Don't ask what your school can do for you, ask what you can do for your school.",
		source: "Josh Zigal",
		link: "http://www.goodreads.com/quotes/tag/school" 
	},
	{
		text: "A good education helps us make sense of the world and find our way in it.",
		source: "Mike Rose",
		link: "http://www.goodreads.com/author/show/81735.Mike_Rose"
	},
	{
		text: "A witty quote proves nothing.",
		source: "Voltaire",
		link: "http://wallbase.cc/wallpaper/1379402"
	}
];