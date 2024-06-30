class ApiFeatures {
  constructor(query, queryStr){
    this.query = query
    this.queryStr = queryStr
  }

  search(){
    const keyword = this.queryStr.keyword ? {
      name: {
        $regex: this.queryStr.keyword,
        $options: 'i'
      }
    } : {}

    this.query = this.query.find(keyword)
    return this
  }

  filter(){
    const queryCopy = { ...this.queryStr }
    
    const excludeFields = ['keyword', 'page']
    excludeFields.forEach(el => delete queryCopy[el])
    
    let queryStr = JSON.stringify(queryCopy)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    this.query = this.query.find(JSON.parse(queryStr))
    return this
  } 

  paginate(resPerPage){
    const page = this.queryStr.page * 1 || 1
    const skip = (page - 1) * resPerPage

    this.query = this.query.limit(resPerPage).skip(skip)
    
    return this
  }
}

export default ApiFeatures