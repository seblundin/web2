interface Credentials {
  username: String;
  password: String;
}

interface UserInput {
  user_name: string;
  email: string;
  password: string;
}

interface UserModify {
  user_name: string;
  email: string;
  password: string;
}

export {Credentials, UserInput, UserModify};
