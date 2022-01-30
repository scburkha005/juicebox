const users = [
  {username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Sidney Australia'},
  {username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: "Ain't tellin'"},
  {username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side'}
]

const posts = [
  {title: 'First Post', content: "This is my first post. I hope I love writing blogs as much as I love writing them.", id: 1, tags: ['#happy', '#youcandoanything']},
  {title: 'Second Post', content: "This is my second post. Won't write another", id: 1, tags: ['#happy', '#worst-day-ever', '#youcandoanything']},
  {title: 'First Post', content: "This is my first post as Sandra. I'm only writing one.", id: 2, tags: ['#happy', '#canmandoeverything']},
  {title: "First Post", content: "Glamgal here. This is my first post. I dont wanna write anymore", id: 3, tags: ['#definitelynobugs']}
]

const tags = [
  {tags: '#tag'},
  {tags: '#othertag'},
  {tags: '#moretag'}
]

module.exports = {
  users,
  posts,
  tags
}