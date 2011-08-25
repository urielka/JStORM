function inner_relations(){
	var TreeNode = new JStORM.Model({
		name: "TreeNode",
		fields: {
			data: new JStORM.Field({
				type: "String",
				maxLength: 25
			}),
			parent: new JStORM.Field({
				relationType: "OneToMany",
				relatedModel: "TreeNode",
				allowNull: true
			}),
			children: new JStORM.Field({
				relationType: "ManyToOne",
				relatedModel: "TreeNode",
				relatedColumnName: "parent"
			})
		},
		connection: "default"
	});
	
	return UnitTest.run({
		up: function(){
			TreeNode.dropTable();
			TreeNode.createTable();
		},
		"1 test that create with null and inner relation works": function(){
			var root = new TreeNode({
				data: "i am the root",
				parent: null
			}).save();
			var node1 = new TreeNode({
				data: "i am node 1",
				parent: root
			}).save();
			var node2 = new TreeNode({
				data: "i am node 2",
				parent: root
			}).save();
		},
		"2 test that select works": function(){
			UnitTest.assertEqual(2, new TreeNode(1).children.toArray().length);
		},
		"3 test that remove works": function(){
			var root = new TreeNode(1);
			root.children.remove();
			UnitTest.assertEqual(0, root.children.toArray().length);
		},
		down: function(){
			TreeNode.dropTable();
		}
	});	
}
