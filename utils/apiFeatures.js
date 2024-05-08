class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  Filtering() {
    console.log(this.queryString);
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);

    this.query = this.query.find(queryStr);
    return this;
  }

  Sorting() {
    //SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      //sort by createdAt descending (newest first)
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  LimitFields() {
    //limit Fields
    if (this.queryString.fields) {
      const limits = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(limits);
    } else {
      // -fieldName means excluded
      this.query = this.query.select('-__v');
    }

    return this;
  }
  Paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;

    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
