function m2m_relations(){
        var Post = new JStORM.Model({
            name: "Post",
            fields:{
                title: new JStORM.Field({
                    type:"String",
                    maxLength:100
                }),
                body: new JStORM.Field({
                    type:"String",
                    maxLength:100
                }),
                tags: new JStORM.Field({
                    relationType:"ManyToMany",
                    relatedModel:"Tag"
                })
            },
            connection: "default"
        });

        var Tag = new JStORM.Model({
            name: "Tag",
            fields:{
                name: new JStORM.Field({
                    type:"String",
                    maxLength:100
                }),
                posts: new JStORM.Field({
                    relationType:"ManyToMany",
                    relatedModel:"Post"
                })
            },
            connection: "default"
        });
        return UnitTest.run({
                up: function(){
                    Post.dropTable();
                    Tag.dropTable();
                    Post.createTable()
                    Tag.createTable();
                },
                "1 test relating objects":function(){
                    var post = new Post({title:"test",body:"test body"}).save();
                    var tag = new Tag({name:"test tag"}).save();
                    post.tags.add(tag);
                    UnitTest.assertEqual(1,post.tags.count());
                },
                "2 test selecting all related objects":function(){
                    var post = Post.all().first();
                    var tags = post.tags.toArray();
                    //should get one tag
                    UnitTest.assertEqual(1,tags.length);
                    //check that we are getting tags,using some privates :(
                    UnitTest.assertEqual(Tag._meta.tableName,tags[0].modelClass._meta.tableName);
                },
                "3 test unrelating objects":function(){
                    var post = Post.all().first();
                    var tag = Tag.all().first();
                    post.tags.remove(tag);
                    UnitTest.assertEqual(0,post.tags.count());
                },
                down: function(){
                    Post.dropTable();
                    Tag.dropTable();
                }
        });
}