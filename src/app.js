import Backbone from 'backbone';
import Store from 'backbone.localstorage';
import _ from 'underscore';
import $ from 'jquery';

let app = {};

// Model
app.TodoModel = Backbone.Model.extend({
  defaults: {
    title: '',
    completed: false
  }
});

// Collection
app.TodoListCollection = Backbone.Collection.extend({
  model: app.TodoModel,
  localStorage: new Store('backbone-todo')
});

app.todoList = new app.TodoListCollection();

// Views
app.TodoView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#item-template').html()),
  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

app.AppView = Backbone.View.extend({
  el: '#todoapp',
  initialize: function () {
    this.input = this.$('#new-todo');

    // When a to-do is added to the collection
    // -> trigger the `this.addOne` fn to add it to the view
    // -> with `this` context
    app.todoList.on('add', this.addOne, this);
    app.todoList.on('reset', this.addAll, this);
    // populate collection with elements from localStorage
    app.todoList.fetch();
  },
  events: {
    'keypress #new-todo': 'createTodoOnEnter'
  },
  createTodoOnEnter: function (e) {
    if (e.which !== 13 || !this.input.val().trim()) {
      return;
    }

    // Adding to-do from input to the collection
    app.todoList.create({
      title: this.input.val().trim(),
      completed: false
    });

    this.input.val('');
  },
  addOne: function (todo) {
    // `tod0` here is the collection element we've just created
    const view = new app.TodoView({ model: todo });
    // we render the TodoView from here and append it to the view
    $('#todo-list').append(view.render().el);
  },
  addAll: function () {
    this.$('#todo-list').html('');
    app.todoList.each(this.addOne, this);
  }
});

app.appView = new app.AppView();















