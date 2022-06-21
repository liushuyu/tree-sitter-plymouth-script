; Special identifiers
;--------------------

((identifier) @constructor
 (#match? @constructor "^[A-Z]"))

((identifier) @variable.builtin
 (#match? @variable.builtin "^(Math|Plymouth|Window)$")
 (#is-not? local))

; Function and method definitions
;--------------------------------

(function
  name: (identifier) @function)
(function_declaration
  name: (identifier) @function)

(assignment_expression
  left: (member_expression
    property: (property_identifier) @function.method)
  right: [(function)])

(assignment_expression
  left: (identifier) @function
  right: [(function)])

; Function and method calls
;--------------------------

(call_expression
  function: (identifier) @function)

(call_expression
  function: (member_expression
    property: (property_identifier) @function.method))

; Variables
;----------

(identifier) @variable

; Properties
;-----------

(property_identifier) @property

; Literals
;---------

(comment) @comment

[
  (string)
] @string

(number) @number

; Tokens
;-------

[
  ";"
  "."
  ","
] @punctuation.delimiter

[
  "-"
  "--"
  "-="
  "+"
  "++"
  "+="
  "*"
  "*="
  "**"
  "**="
  "/"
  "/="
  "%"
  "%="
  "<"
  "<="
  "<<"
  "<<="
  "="
  "=="
  "!"
  "!="
  ">"
  ">="
  ">>"
  ">>="
  "~"
  "^"
  "&"
  "|"
  "^="
  "&="
  "|="
  "&&"
  "||"
  "&&="
  "||="
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket

[
  "break"
  "continue"
  "else"
  "for"
  "if"
  "return"
  "while"
  "fun"
] @keyword
