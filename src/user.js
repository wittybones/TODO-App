const fs = require('fs');

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
    fs.writeFile(this.file, JSON.stringify(data), () => {});
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
    fs.readFile(this.file, 'utf8', callback);
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
  constructor(title) {
    this.title = title;
    this.items = new Array();
  }

  addItem(item) {
    this.items.push(item);
  }

  doneItem(item) {
    item.status = 'done';
  }

  undoneItem(item) {
    item.status = 'undone';
  }

  removeItem(item) {
    let itemIndex = this.items.indexOf(item);
    this.items.splice(itemIndex, 1);
  }
}

class Item {
  constructor(content, status) {
    this.content = content;
    this.status = status;
  }
}

module.exports = { Item, User, List };
