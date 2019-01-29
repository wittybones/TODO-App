const fs = require("fs");

class Item {
  constructor(content, id, status) {
    this.content = content;
    this.id = id;
    this.status = status;
  }
}

class User {
  constructor(userId, password, todoLists) {
    this.userId = userId;
    this.password = password;
    this.file = `./private_data/${this.userId}.json`;
    this.todoLists = todoLists;
  }
  addList(list) {
    this.todoLists.push(list);
  }

  match(password) {
    return this.password == password;
  }

  writeToFile(data) {
    fs.writeFileSync(this.file, JSON.stringify(data));
  }

  writeListsToFile() {
    this.writeToFile(this.todoLists);
  }

  writeUserDetailsToFile() {
    let userDetails = {
      userId: this.userId,
      password: this.password,
      todoLists: this.todoLists
    };
    this.writeToFile(userDetails);
  }

  parse(data) {
    return JSON.parse(data);
  }

  stringify(data) {
    return JSON.stringify(data);
  }

  getFile(callback) {
    fs.readFile(this.file, "utf8", callback);
  }

  getTitle(element) {
    return element.title;
  }

  getListTitles() {
    let listTitles = this.todoLists.map(this.getTitle);
    return listTitles;
  }

  getList(listname) {
    let list = this.todoLists.filter(todoList => todoList.title == listname);
    return list[0];
  }

  removeList(list) {
    let listIndex = this.todoLists.indexOf(list);
    this.todoLists.splice(listIndex, 1);
  }
}

class List {
  constructor(title, description) {
    this.title = title;
    this.description = description;
    this.items = new Array();
  }

  replaceItems(items) {
    this.items = items;
  }

  getNextItemId() {
    if (this.items.length <= 0) {
      return 1;
    }
    return this.items[this.items.length - 1].id + 1;
  }

  addItem(content) {
    const itemId = this.getNextItemId();
    let item = new Item(content, itemId, false);
    this.items.push(item);
  }

  doneItem(item) {
    item.status = "done";
  }

  undoneItem(item) {
    item.status = "undone";
  }

  removeItem(item) {
    let itemIndex = this.items.indexOf(item);
    this.items.splice(itemIndex, 1);
  }
}

module.exports = { Item, User, List };
