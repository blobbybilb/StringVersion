// node_modules/msldiff/MSLDiff.js
class MSLDiff {
  static lineSeparator = "\n";
  static diff(a, b) {
    const x = new Map(a.split(this.lineSeparator).map((e, i) => [e, i]));
    const r = [];
    for (let l of b.split(this.lineSeparator)) {
      if (x.has(l))
        r.push(x.get(l));
      else
        r.push(l);
    }
    return r;
  }
  static edit(a, d) {
    const x = new Map(a.split(this.lineSeparator).entries());
    return d.map((e) => typeof e === "number" ? x.get(e) : e).join("\n");
  }
}

// StringVersion.ts
class VersionCheckpoint {
  initial;
  edits;
  cache;
  constructor(initial, edits = []) {
    this.initial = initial;
    this.edits = edits;
  }
  get(v) {
    let r = this.initial;
    for (let i = 0;i < v; i++) {
      r = MSLDiff.edit(r, this.edits[i]);
    }
    return r;
  }
  get count() {
    return this.edits.length;
  }
  get current() {
    return this.cache ?? this.get(this.count);
  }
  set current(v) {
    this.edits.push(MSLDiff.diff(this.current, v));
    this.cache = v;
  }
  updateCurrent(v) {
    this.edits.pop();
    this.current = v;
  }
  get hash() {
    const editLengths = this.edits.map((edit) => edit.length).join("-");
    return `${this.initial.length}_${editLengths}|${this.current}`;
  }
}

class VersionStringConfig {
  static updateDecider = (a, b) => {
    const diff = MSLDiff.diff(a, b);
    const linesChanged = [];
    if (a.split("\n").length !== b.split("\n").length)
      return false;
    diff.forEach((e, i) => {
      if (typeof e === "string")
        linesChanged.push(i);
    });
    console.log(4, diff);
    console.log(5, linesChanged);
    return linesChanged.length < 2;
  };
}

class VersionedString {
  checkpoints;
  constructor(data) {
    this.checkpoints = data;
  }
  get lastCheckpoint() {
    return this.checkpoints[this.checkpoints.length - 1];
  }
  get current() {
    return this.lastCheckpoint.current;
  }
  set current(v) {
    if (this.current === v)
      return;
    if (VersionStringConfig.updateDecider && VersionStringConfig.updateDecider(this.current, v)) {
      this.lastCheckpoint.updateCurrent(v);
      return;
    }
    if (v.length < 100 || !v.includes("\n") || this.checkpoints.length > 10) {
      this.checkpoints.push(new VersionCheckpoint(v));
    } else {
      this.lastCheckpoint.current = v;
    }
  }
}
export {
  VersionedString,
  VersionCheckpoint
};
