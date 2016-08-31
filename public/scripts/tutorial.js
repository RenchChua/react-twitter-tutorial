var data = [
  {id: 1, author: "Foo Bar", text:"This is one such comment"},
  {id: 2, author: "Spaz Baz", text:"This is *yet another* comment"}
]

var CommentBox = React.createClass({
  loadCommentsFromServer: function () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function (comment) {
    var comments = this.state.data;
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function (data) {
        this.setState({data: data})
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({data:comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function () {
    return {data: []}
  },
  componentDidMount: function () {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function () {
    return(
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data}/>
        <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
      </div>
    )
  }
});

var CommentList = React.createClass({
  render: function () {
    var commentNodes = this.props.data.map(function (comment) {
      return(
        <div>
          <em>delete</em>
          <h3>
            <Comment text={comment.text} author={comment.author} key={comment.id}>
              {comment.text}
            </Comment>
          </h3>
        </div>

      );
    });
    return(
      <div className="CommentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function () {
    return {author: '', text: '', characters: 0, alert: ""}
  },
  handleAuthorChange: function (e) {
    e.preventDefault;
    this.setState({author:e.target.value});
  },
  handleTextChange: function (e) {
    e.preventDefault;
    if(this.state.characters <140){
      this.setState({text: e.target.value.slice(0,140), characters: this.state.text.trim().length});
    }else{
      this.setState({text:e.target.value.slice(0,140), characters: this.state.text.trim().length});
    }
    if (e.target.value.length < 141) {
      this.setState({alert: ""});
    }

  },
  handleSubmit: function (e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text) {
      alert("Text can't be empty")
      return;
    }else if (!author) {
      alert("Author can't be empty")
      return;
    } else if (this.state.text.trim().length >140) {
      alert("Text exceeded max length")
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.setState({author: '', text: '', characters: 0})
  },
  addCount: function (e) {
    this.setState({characters: this.state.text.trim().length})
    if (e.target.value.length >= 140) {
      this.setState({alert: "you have reached the max number of characters"})
    }
  },
  render: function () {
    return(
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange}/><br/>
        <textarea
          name="comment"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
          onKeyUp={this.addCount}/><br/>
        <input type="submit" value="Post"/>
        <p>{this.state.characters}</p>
        <p>{this.state.alert}</p>
        </form>
    );
  }
});

var Comment = React.createClass({
  rawMarkup: function () {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return{ __html: rawMarkup};
  },
  render: function () {
    return(
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()}/>
      </div>
    );
  }
});


ReactDOM.render(
  <CommentBox url="/api/comments" pollInterval={2000}/>,
  document.getElementById('content')
);
