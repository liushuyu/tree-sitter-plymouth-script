// Mostly adapted from https://github.com/tree-sitter/tree-sitter-javascript/blob/master/grammar.js

module.exports = grammar({
  name: "plymouth_script",

  inline: ($) => [
    $._call_signature,
    $._formal_parameter,
    $.statement,
    $._lhs_expression,
  ],
  supertypes: ($) => [
    $.statement,
    $.declaration,
    $.expression,
    $.primary_expression,
    $.pattern,
  ],
  extras: ($) => [
    $.comment,
    /\s|\\\r?\n/,
  ],
  conflicts: ($) => [
    [$.array, $.array_pattern],
    [$.primary_expression, $.pattern],
    [$.expression, $.for_statement],
  ],
  word: ($) => $.identifier,

  precedences: ($) => [
    [
      "member",
      "call",
      $.update_expression,
      "unary_void",
      "binary_exp",
      "binary_times",
      "binary_plus",
      "binary_shift",
      "binary_compare",
      "binary_relation",
      "binary_equality",
      "bitwise_and",
      "bitwise_xor",
      "bitwise_or",
      "logical_and",
      "logical_or",
      "ternary",
      // $.sequence_expression,
      // $.arrow_function
    ],
    ["assign", $.primary_expression],
    ["member", "new", "call", $.expression],
    ["declaration", "literal"],
    [$.primary_expression, $.statement_block, "object"],
  ],

  rules: {
    program: ($) => repeat($.statement),
    comment: ($) =>
      token(choice(
        seq("#", /.*/),
        seq("//", /.*/),
        seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),
      )),
    identifier: ($) => token(/[A-Za-z_]\w*/),
    formal_parameters: ($) =>
      seq(
        "(",
        optional(seq(
          commaSep1($.identifier),
          optional(","),
        )),
        ")",
      ),

    expression: ($) =>
      choice(
        $.primary_expression,
        $.assignment_expression,
        $.augmented_assignment_expression,
        $.unary_expression,
        $.binary_expression,
        $.update_expression,
      ),
    primary_expression: ($) =>
      choice(
        $.subscript_expression,
        $.member_expression,
        $.parenthesized_expression,
        $.identifier,
        $.function,
        $.number,
        $.string,
        $.array,
        $.call_expression,
      ),
    assignment_expression: ($) =>
      prec.right(
        "assign",
        seq(
          field("left", choice($.parenthesized_expression, $._lhs_expression)),
          "=",
          field("right", $.expression),
        ),
      ),
    subscript_expression: ($) =>
      prec.right(
        "member",
        seq(
          field("object", choice($.expression, $.primary_expression)),
          "[",
          field("index", $.expression),
          "]",
        ),
      ),
    member_expression: ($) =>
      prec(
        "member",
        seq(
          field("object", choice($.expression, $.primary_expression)),
          ".",
          field("property", alias($.identifier, $.property_identifier)),
        ),
      ),
    binary_expression: ($) =>
      choice(
        ...[
          ["&&", "logical_and"],
          ["||", "logical_or"],
          [">>", "binary_shift"],
          ["<<", "binary_shift"],
          ["&", "bitwise_and"],
          ["^", "bitwise_xor"],
          ["|", "bitwise_or"],
          ["+", "binary_plus"],
          ["-", "binary_plus"],
          ["*", "binary_times"],
          ["/", "binary_times"],
          ["%", "binary_times"],
          ["**", "binary_exp"],
          ["<", "binary_relation"],
          ["<=", "binary_relation"],
          ["==", "binary_equality"],
          ["!=", "binary_equality"],
          [">=", "binary_relation"],
          [">", "binary_relation"],
        ].map(([operator, precedence]) =>
          prec.left(
            precedence,
            seq(
              field("left", $.expression),
              field("operator", operator),
              field("right", $.expression),
            ),
          )
        ),
      ),
    augmented_assignment_expression: $ => prec.right('assign', seq(
      field('left', choice($.parenthesized_expression, $._lhs_expression)),
      field('operator', choice('+=', '-=', '*=', '/=', '%=', '^=', '&=', '|=', '>>=',
        '<<=', '**=', '&&=', '||=')),
      field('right', $.expression)
    )),
    unary_expression: $ => prec.left('unary_void', seq(
      field('operator', choice('!', '~', '-', '+')),
      field('argument', $.expression)
    )),
    update_expression: ($) =>
      prec.left(choice(
        seq(
          field("argument", $.expression),
          field("operator", choice("++", "--")),
        ),
        seq(
          field("operator", choice("++", "--")),
          field("argument", $.expression),
        ),
      )),
    _lhs_expression: ($) =>
      choice(
        $.member_expression,
        $.subscript_expression,
        $.identifier,
        $.array_pattern,
      ),
    pattern: ($) => prec.dynamic(-1, $._lhs_expression),
    array_pattern: ($) =>
      seq(
        "[",
        commaSep(optional($.pattern)),
        "]",
      ),
    array: ($) =>
      seq(
        "[",
        commaSep(optional($.expression)),
        "]",
      ),

    _call_signature: ($) => field("parameters", $.formal_parameters),
    arguments: ($) =>
      seq(
        "(",
        commaSep(optional($.expression)),
        ")",
      ),
    call_expression: ($) =>
      prec(
        "call",
        seq(
          field("function", $.expression),
          field("arguments", choice($.arguments)),
        ),
      ),

    statement: ($) =>
      choice(
        $.expression_statement,
        $.declaration,
        $.statement_block,
        $.if_statement,
        $.for_statement,
        $.while_statement,
        $.return_statement,
        $.break_statement,
        $.continue_statement,
      ),
    declaration: ($) =>
      choice(
        $.function_declaration,
      ),
    expression_statement: ($) =>
      seq(
        $.expression,
        $._semicolon,
      ),
    statement_block: ($) =>
      prec.right(seq(
        "{",
        repeat($.statement),
        "}",
      )),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),

    else_clause: $ => seq('else', $.statement),

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $.parenthesized_expression),
      field('consequence', $.statement),
      optional(field('alternative', $.else_clause))
    )),
    for_statement: $ => seq(
      'for',
      '(',
      field('initializer', choice(
        $.assignment_expression,
        $.expression_statement,
        $.empty_statement
      )),
      field('condition', choice(
        $.expression_statement,
        $.empty_statement
      )),
      field('increment', optional($.expression)),
      ')',
      field('body', $.statement)
    ),
    while_statement: $ => seq(
      'while',
      field('condition', $.parenthesized_expression),
      field('body', $.statement)
    ),
    return_statement: $ => seq(
      'return',
      optional($.expression),
      $._semicolon
    ),
    break_statement: $ => seq(
      'break',
      $._semicolon
    ),
    continue_statement: $ => seq(
      'continue',
      $._semicolon
    ),

    string: $ => choice(
      seq(
        '"',
        repeat(choice(
          alias($.unescaped_double_string_fragment, $.string_fragment),
          $.escape_sequence
        )),
        '"'
      )
    ),
    escape_sequence: $ => token.immediate(seq(
      '\\',
      /[ne0"]/
    )),
    unescaped_double_string_fragment: $ =>
      token.immediate(prec(1, /[^"\\]+/)),

    function: ($) =>
      prec(
        "literal",
        seq(
          "fun",
          field("name", optional($.identifier)),
          $._call_signature,
          field("body", $.statement_block),
        ),
      ),
    function_declaration: ($) =>
      prec.right(
        "declaration",
        seq(
          "fun",
          field("name", $.identifier),
          $._call_signature,
          field("body", $.statement_block),
        ),
      ),

    number: ($) => {
      const decimal_digits = /\d(_?\d)*/;
      const signed_integer = seq(optional(choice("-", "+")), decimal_digits);
      const exponent_part = seq(choice("e", "E"), signed_integer);
      const decimal_integer_literal = choice(
        "0",
        seq(optional("0"), /[1-9]/, optional(decimal_digits)),
      );

      const decimal_literal = choice(
        seq(
          decimal_integer_literal,
          ".",
          optional(decimal_digits),
          optional(exponent_part),
        ),
        seq(".", decimal_digits, optional(exponent_part)),
        seq(decimal_integer_literal, exponent_part),
        seq(decimal_digits),
      );
      return token(decimal_literal);
    },

    _semicolon: ($) => ";",
    empty_statement: $ => ';',
  },
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}
