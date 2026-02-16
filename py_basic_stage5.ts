
import { Lesson } from './types';

export const py_basic_stage5: Lesson = {
  id: 'py5',
  title: 'STEP 5. 반복문 (for / while)',
  description: '정해진 횟수나 특정 조건 동안 명령을 반복하는 법을 배웁니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py5_p1',
      title: '1. for 반복문',
      content:
        'for 문은 정해진 횟수만큼 반복할 때 주로 사용합니다. range(3)은 0부터 2까지 숫자를 하나씩 꺼내어 i에 담으며 코드를 반복합니다.\n(로직 흐름 추적을 적극 활용해주세요!)',
      code: 'for i in range(3):\n    print(i)',
      exampleOutput: '0\n1\n2',
      traceFlow: [0, 1, 0, 1, 0, 1],
      variableHistory: [
        { "i": 0 }, { "i": 0 },
        { "i": 1 }, { "i": 1 },
        { "i": 2 }, { "i": 2 }
      ],
      explanations: [
        {
          id: 'ex5_1',
          codeLine: 0,
          title: '범위 설정',
          text: 'range(3)은 0부터 시작해 3보다 작은 숫자까지 반복합니다.',
          type: 'blue',
          badge: 'for'
        },
        {
          id: 'ex5_2',
          codeLine: 1,
          title: '코드 실행',
          text: 'i가 0, 1, 2일 때 print가 실행됩니다.',
          type: 'green',
          badge: '1'
        }
      ]
    },

    {
      id: 'py5_p1_2',
      title: '2. range(start, end, step)',
      content:
        'range()는 시작값, 끝값, 증가폭을 지정할 수 있습니다. end 값은 포함되지 않으며, step을 이용해 건너뛰거나 역순 반복도 가능합니다.\n(로직 흐름 추적을 적극 활용해주세요!)',
      code:
        'for i in range(1, 10, 2):\n    print(i)\n\nfor i in range(5, 0, -1):\n    print(i)',
      exampleOutput: '1\n3\n5\n7\n9\n5\n4\n3\n2\n1',
      traceFlow: [
        0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
        3, 4, 3, 4, 3, 4, 3, 4, 3, 4
      ],
      variableHistory: [
        { "i": 1 }, { "i": 1 }, { "i": 3 }, { "i": 3 }, { "i": 5 }, { "i": 5 }, { "i": 7 }, { "i": 7 }, { "i": 9 }, { "i": 9 },
        { "i": 5 }, { "i": 5 }, { "i": 4 }, { "i": 4 }, { "i": 3 }, { "i": 3 }, { "i": 2 }, { "i": 2 }, { "i": 1 }, { "i": 1 }
      ],
      explanations: [
        {
          id: 'ex5_2_1',
          codeLine: 0,
          title: '증가폭 사용',
          text: '2씩 증가하며 1, 3, 5, 7, 9가 출력됩니다.',
          type: 'blue',
          badge: 'step'
        },
        {
          id: 'ex5_2_2',
          codeLine: 3,
          title: '역순 반복',
          text: 'step을 음수로 주면 큰 수에서 작은 수로 반복할 수 있습니다.',
          type: 'purple',
          badge: 'reverse'
        }
      ]
    },

    {
      id: 'py5_p2',
      title: '3. while 반복문',
      content:
        'while 문은 조건이 참(True)인 동안 계속해서 코드를 반복합니다. 반복 횟수가 미리 정해지지 않았을 때 유용합니다.\n(로직 흐름 추적을 적극 활용해주세요!)',
      code: 'x = 0\nwhile x < 3:\n    print(x)\n    x += 1',
      exampleOutput: '0\n1\n2',
      traceFlow: [0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1],
      variableHistory: [
        { "x": 0 }, 
        { "x": 0 }, { "x": 0 }, { "x": 1 },
        { "x": 1 }, { "x": 1 }, { "x": 2 },
        { "x": 2 }, { "x": 2 }, { "x": 3 },
        { "x": 3 }
      ],
      explanations: [
        {
          id: 'ex5_3',
          codeLine: 1,
          title: '조건 확인',
          text: 'x가 3보다 작은지 매 반복마다 확인합니다.',
          type: 'blue',
          badge: 'while'
        },
        {
          id: 'ex5_4',
          codeLine: 2,
          title: '코드 실행',
          text: '조건이 참일 때 현재 x 값을 출력합니다.',
          type: 'green',
          badge: '1'
        },
        {
          id: 'ex5_5',
          codeLine: 3,
          title: '값 변화',
          text: 'x 값을 변경하여 반복이 끝날 수 있도록 합니다.',
          type: 'orange',
          badge: '2'
        }
      ]
    },

    {
      id: 'py5_p2_2',
      title: '4. while 무한 루프 주의',
      content:
        'while 문에서 조건에 사용되는 값이 변하지 않으면 무한 루프가 발생합니다. 이는 프로그램이 멈추는 주요 원인이 됩니다.\n로직 흐름 추적에서는 중간에 끝나지만 실제로는 끝나지 않습니다 !!',
      code: 'x = 1\nwhile x > 0:\n    print(x)',
      exampleOutput: '(무한 반복)',
      traceFlow: [0, 1, 2, 1, 2, 1, 2],
      variableHistory: [
        { "x": 1 }, { "x": 1 }, { "x": 1 }, { "x": 1 }, { "x": 1 }, { "x": 1 }, { "x": 1 }
      ],
      explanations: [
        {
          id: 'ex5_inf_1',
          codeLine: 1,
          title: '조건 고정',
          text: 'x의 값이 바뀌지 않아 조건이 항상 참입니다.',
          type: 'red',
          badge: 'danger'
        }
      ]
    },

    {
      id: 'py5_p3',
      title: '5. break와 continue의 차이',
      content:
        '반복문 도중 흐름을 제어하는 두 가지 핵심 명령입니다.\n- break: 반복문을 즉시 종료합니다.\n- continue: 현재 반복만 건너뛰고 다음 반복으로 이동합니다.\n(로직 흐름 추적을 적극 활용해주세요!)',
      code:
        'for i in range(5):\n    if i == 2:\n        continue\n    print(i)',
      exampleOutput: '0\n1\n3\n4',
      traceFlow: [0, 1, 3, 0, 1, 3, 0, 1, 2, 0, 1, 3, 0, 1, 3],
      variableHistory: [
        { "i": 0 }, { "i": 0 }, { "i": 0 },
        { "i": 1 }, { "i": 1 }, { "i": 1 },
        { "i": 2 }, { "i": 2 }, { "i": 2 },
        { "i": 3 }, { "i": 3 }, { "i": 3 },
        { "i": 4 }, { "i": 4 }, { "i": 4 }
      ],
      explanations: [
        {
          id: 'ex5_6',
          codeLine: 1,
          title: '조건 확인',
          text: 'i가 2인지 검사합니다.',
          type: 'blue',
          badge: 'if'
        },
        {
          id: 'ex5_7',
          codeLine: 2,
          title: 'continue',
          text: 'print를 건너뛰고 다음 반복으로 이동합니다.',
          type: 'orange',
          badge: 'skip'
        },
        {
          id: 'ex5_8',
          codeLine: 3,
          title: '출력',
          text: '2를 제외한 값만 출력됩니다.',
          type: 'green',
          badge: '1'
        }
      ]
    }
  ],

  conceptProblems: [
    {
      id: 'py5_c1',
      question: 'Q1. 반복 횟수가 미리 정해져 있을 때 주로 사용하는 반복문은?',
      options: ['if', 'for', 'while', 'break'],
      answer: 'for',
      hint: 'range()와 함께 자주 사용됩니다.',
      explanation:
        'for 문은 정해진 범위를 순회하며 반복하기에 적합합니다.',
      type: 'concept'
    },
    {
      id: 'py5_c2',
      question: 'Q2. while문에서 무한 루프가 발생하는 주된 이유는?',
      options: [
        'print가 있기 때문에',
        '조건식이 있기 때문에',
        '조건에 사용된 값이 변하지 않아서',
        'while문이기 때문에'
      ],
      answer: '조건에 사용된 값이 변하지 않아서',
      hint: '조건이 언제 False가 되는지 생각해보세요.',
      explanation:
        '조건에 사용된 값이 반복문 안에서 바뀌지 않으면 조건은 계속 True입니다.',
      type: 'concept'
    },
    {
      id: 'py5_c3',
      question: 'Q3. range(1, 10, 2)의 출력 결과로 올바른 것은?',
      options: [
        '1 2 3 4 5 6 7 8 9',
        '1 3 5 7 9',
        '2 4 6 8 10',
        '0 2 4 6 8'
      ],
      answer: '1 3 5 7 9',
      hint: 'step 값에 주목하세요.',
      explanation:
        'range(1, 10, 2)는 1부터 시작해 2씩 증가하며 10 미만까지 반복합니다.',
      type: 'concept'
    },
    {
      id: 'py5_c4',
      question: 'Q4. 다음 중 반복문을 즉시 종료하는 명령어는?',
      options: ['continue', 'pass', 'break', 'return'],
      answer: 'break',
      hint: '반복문을 완전히 빠져나갑니다.',
      explanation:
        'break는 반복문을 즉시 종료하고 반복문 밖으로 나갑니다.',
      type: 'concept'
    },
    {
      id: 'py5_c5',
      question: 'Q5. continue의 역할로 가장 알맞은 것은?',
      options: [
        '반복문을 종료한다',
        '조건문을 종료한다',
        '현재 반복만 건너뛴다',
        '프로그램을 종료한다'
      ],
      answer: '현재 반복만 건너뛴다',
      hint: '다음 반복으로 바로 이동합니다.',
      explanation:
        'continue는 아래 코드를 실행하지 않고 다음 반복으로 넘어갑니다.',
      type: 'concept'
    }
  ],

  codingProblems: [
    {
      id: 'py5_cp1',
      question: '문제 1. for 반복문을 사용하여 1부터 5까지 한 줄씩 출력하시오.',
      answer: 'for i in range(1, 6):\n    print(i)',
      hint: 'range(1, 6)을 사용하세요.',
      type: 'coding',
      exampleOutput: '1\n2\n3\n4\n5'
    },
    {
      id: 'py5_cp2',
      question:
        '문제 2. while문을 사용하여 5부터 1까지 역순으로 출력하시오.',
      answer:
        'x = 5\nwhile x > 0:\n    print(x)\n    x -= 1',
      hint: '조건에 사용되는 값이 변하도록 하세요.',
      type: 'coding',
      exampleOutput: '5\n4\n3\n2\n1'
    },
    {
      id: 'py5_cp3',
      question:
        '문제 3. for 반복문과 range를 사용하여 짝수만 출력하시오. (2~10)',
      answer:
        'for i in range(2, 11, 2):\n    print(i)',
      hint: 'step 값을 활용하세요.',
      type: 'coding',
      exampleOutput: '2\n4\n6\n8\n10'
    },
    {
      id: 'py5_cp4',
      question:
        '문제 4. 1부터 10까지 출력하되, 숫자 5는 출력하지 마시오.',
      answer:
        'for i in range(1, 11):\n    if i == 5:\n        continue\n    print(i)',
      hint: 'continue를 사용해보세요.',
      type: 'coding',
      exampleOutput: '1\n2\n3\n4\n6\n7\n8\n9\n10'
    },
    {
      id: 'py5_cp5',
      question:
        '문제 5. while문을 사용하여 입력한 숫자가 0이 될 때까지 숫자를 출력하시오.',
      answer:
        'n = int(input())\nwhile n != 0:\n    print(n)\n    n = int(input())',
      hint: '조건이 언제 False가 되는지 생각하세요.',
      type: 'coding',
      exampleOutput: '(입력값에 따라 다름)'
    }
  ]
};
