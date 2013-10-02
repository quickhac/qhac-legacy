var attr = Ember.attr, hasMany = Ember.hasMany;

QHAC.User = Ember.Model.extend({
  id: attr(),
  name: attr(),
  comments: hasMany("QHAC.Comment", {key: 'comments', embedded: true})
});

QHAC.User.adapter = QHAC.adapter.create();

QHAC.Comment = Ember.Model.extend({
  id: attr(),
  text: attr()
});

QHAC.Comment.adapter = QHAC.adapter.create();

newUser = QHAC.User.create({name: "Erik"});
newUser.save();
comment = QHAC.Comment.create({text: "hello"});
comment2 = QHAC.Comment.create({text: "anoop"});
comments = newUser.get('comments');
console.log(comments);
comments.addObject(comment);
comments.save();
newUser.save();