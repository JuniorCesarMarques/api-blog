module.exports = class {
  static async createPost(req, res) {
    const { title, content } = req.body;

    try {
      const newPost = new Post({
        title,
        content,
        author: req.user.id, // O id do usuário autenticado (decodificado do token)
      });
  
      await newPost.save();
  
      res.status(201).json({ message: "Post criado com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar o post", error });
    }
  }
};
