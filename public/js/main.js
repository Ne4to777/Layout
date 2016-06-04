var Controller, Model, ModelEvent, SelectView, TextAreaView, View, controller, db, model, modelEvent, selectView, textAreaView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ModelEvent = (function() {
  function ModelEvent() {
    this.notify = bind(this.notify, this);
    this.observers = [];
  }

  ModelEvent.prototype.subscribe = function(sender, handler) {
    return this.observers.push({
      sender: sender,
      handler: handler
    });
  };

  ModelEvent.prototype.notify = function(msg) {
    var i, j, len, obs, ref;
    ref = this.observers;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      obs = ref[i];
      obs.handler.call(obs.sender);
    }
    return console.info(msg);
  };

  return ModelEvent;

})();

Model = (function() {
  function Model(_data, notify) {
    this._data = _data;
    this.notify = notify;
  }

  Model.prototype.get = function() {
    return this._data;
  };

  Model.prototype.add = function(item) {
    this._data.push(item);
    return this.notify("Model changed - item \"" + item + "\" added");
  };

  Model.prototype.del = function(index) {
    var item;
    item = this._data[index];
    this._data.splice(index, 1);
    return this.notify("Model changed - item \"" + item + "\" deleted");
  };

  return Model;

})();

View = (function() {
  function View(_model) {
    this._model = _model;
    this.data = this._model.get();
    this.update();
  }

  View.prototype.subscribe = function(modelEvent) {
    return modelEvent.subscribe(this, this.update);
  };

  View.prototype.clear = function(parentNode) {
    var results;
    results = [];
    while (parentNode.firstChild) {
      results.push(parentNode.removeChild(parentNode.firstChild));
    }
    return results;
  };

  View.prototype.fill = function(parentNode, childNodeTag) {
    return parentNode.appendChild(document.createElement(childNodeTag));
  };

  View.prototype._add = function(item) {
    return this._model.add(item);
  };

  View.prototype._del = function(index) {
    return this._model.del(index);
  };

  return View;

})();

SelectView = (function(superClass) {
  extend(SelectView, superClass);

  function SelectView(model, list, addBtn, delBtn) {
    this._del = bind(this._del, this);
    this._add = bind(this._add, this);
    this._getActiveOpt = bind(this._getActiveOpt, this);
    this.list = document.querySelector(list);
    this.addBtn = document.querySelector(addBtn);
    this.delBtn = document.querySelector(delBtn);
    this._activeOpt = null;
    SelectView.__super__.constructor.apply(this, arguments);
  }

  SelectView.prototype._getActiveOpt = function(e) {
    if (e.target.localName === 'option') {
      return this._activeOpt = e.target.index;
    }
  };

  SelectView.prototype._add = function() {
    return SelectView.__super__._add.call(this, prompt('Enter new word'));
  };

  SelectView.prototype._del = function() {
    if (this._activeOpt != null) {
      SelectView.__super__._del.call(this, this._activeOpt);
    }
    return this._activeOpt = null;
  };

  SelectView.prototype.update = function() {
    var i, j, len, ref, results;
    this.clear(this.list);
    ref = this.data;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      results.push(this.fill(this.list, 'option').innerText = i);
    }
    return results;
  };

  SelectView.prototype.getBindingObjects = function() {
    return {
      list: {
        element: this.list,
        event: 'click',
        handler: this._getActiveOpt
      },
      addBtn: {
        element: this.addBtn,
        event: 'click',
        handler: this._add
      },
      delBtn: {
        element: this.delBtn,
        event: 'click',
        handler: this._del
      }
    };
  };

  return SelectView;

})(View);

TextAreaView = (function(superClass) {
  extend(TextAreaView, superClass);

  function TextAreaView(model, textarea, paragraph) {
    this._del = bind(this._del, this);
    this._add = bind(this._add, this);
    this.paragraph = document.querySelector(paragraph);
    this.textarea = document.querySelector(textarea);
    TextAreaView.__super__.constructor.apply(this, arguments);
  }

  TextAreaView.prototype._add = function(e) {
    if (e.key === "Enter") {
      return TextAreaView.__super__._add.call(this, this.textarea.value);
    }
  };

  TextAreaView.prototype._del = function(e) {
    if (e.target.tagName === "SPAN") {
      return TextAreaView.__super__._del.call(this, e.target.title);
    }
  };

  TextAreaView.prototype.update = function() {
    var i, j, len, ref, results, val;
    if (this.textarea.value != null) {
      this.textarea.value = '';
    }
    if (this.paragraph.innerHTML != null) {
      this.paragraph.innerHTML = '';
    }
    ref = this.data;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      val = ref[i];
      results.push(this.paragraph.innerHTML += "<span title=" + i + ">" + val + "</span></br>");
    }
    return results;
  };

  TextAreaView.prototype.getBindingObjects = function() {
    return {
      textarea: {
        element: this.textarea,
        event: 'keypress',
        handler: this._add
      },
      paragraph: {
        element: this.paragraph,
        event: 'click',
        handler: this._del
      }
    };
  };

  return TextAreaView;

})(View);

Controller = (function() {
  function Controller() {}

  Controller.prototype.link = function(objects) {
    var i, obj, results;
    results = [];
    for (i in objects) {
      obj = objects[i];
      results.push(obj.element.addEventListener(obj.event, obj.handler));
    }
    return results;
  };

  Controller.prototype.unlink = function(objects) {
    var i, obj, results;
    results = [];
    for (i in objects) {
      obj = objects[i];
      results.push(obj.element.removeEventListener(obj.event, obj.handler));
    }
    return results;
  };

  return Controller;

})();

db = ["one", "two", "three"];

modelEvent = new ModelEvent;

model = new Model(db, modelEvent.notify);

selectView = new SelectView(model, "select.input", "button.add", "button.del");

selectView.subscribe(modelEvent);

textAreaView = new TextAreaView(model, "textarea.input", "p.output");

textAreaView.subscribe(modelEvent);

controller = new Controller;

document.onload = controller.link(selectView.getBindingObjects());

document.onload = controller.link(textAreaView.getBindingObjects());
