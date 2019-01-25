const fs = require('fs');

class User {
  constructor(userId, password) {
    this.userId = userId;
    this.password = password;
    this.file = `./private_data/${this.userId}.json`;
    this.todoLists = new Array();
  }
  addList(list) {
    this.todoLists.push(list);
  }

  writeToFile(data) {
    fs.writeFile(this.file, this.stringify(data), () => {});
  }

  writeListsToFile() {
    this.writeToFile(this.todoLists);
  }

  writeUserDetailsToFile() {
    let userDetails = {
      userId: this.userId,
      password: this.password
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
    let parsedLists = this.todoLists;
    parsedLists.shift();
    let lists = parsedLists.map(this.getTitle);
    return lists;
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
