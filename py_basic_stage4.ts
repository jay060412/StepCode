
import { Lesson } from './types';

export const py_basic_stage4: Lesson = {
  id: 'py4',
  title: 'STEP 4. 조건문 (if)',
  description: '상황에 따라 다른 명령을 내리는 법을 배웁니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py4_p1',
      title: '1. if 문 기본 구조',
      content:
        'if 문은 특정 조건이 참(True)일 때만 코드를 실행합니다. 조건식 뒤에는 반드시 콜론(:)을 붙여야 하며, 실행할 코드는 들여쓰기를 해야 합니다.',
      code: 'x = 10\nif x > 5:\n    print("크다")',
      exampleOutput: '크다',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { x: 10 },
        { x: 10 },
        { x: 10 }
      ],
      explanations: [
        { id: 'ex4_1', codeLine: 1, title: '조건식', text: 'x가 5보다 큰지 확인합니다. 현재 x는 10이므로 참(True)입니다.', type: 'blue', badge: 'if' },
        { id: 'ex4_2', codeLine: 2, title: '코드 실행', text: '조건이 참이므로 "크다"가 출력됩니다.', type: 'green', badge: '1' }
      ]
    },

    {
      id: 'py4_p2',
      title: '2. if / else',
      content:
        '조건이 참일 때와 거짓일 때, 각각 다른 코드를 실행하고 싶다면 else를 사용합니다.\n(로직 흐름 추적을 적극 활용해주세요!)',
      code:
        'x = 3\nif x > 5:\n    print("크다")\nelse:\n    print("작거나 같다")',
      exampleOutput: '작거나 같다',
      traceFlow: [0, 1, 4],
      variableHistory: [
        { x: 3 },
        { x: 3 },
        { x: 3 }
      ],
      explanations: [
        { id: 'ex4_3', codeLine: 1, title: '조건 확인', text: '3은 5보다 크지 않으므로 거짓(False)이 됩니다.', type: 'blue', badge: 'if' },
        { id: 'ex4_4', codeLine: 2, title: '참 블록', text: '조건이 거짓이므로 이 줄은 건너뜁니다.', type: 'red', badge: 'X' },
        { id: 'ex4_5', codeLine: 4, title: '거짓 블록', text: '조건이 거짓일 때 실행되는 else 구문입니다.', type: 'orange', badge: 'else' }
      ]
    },

    {
      id: 'py4_p3',
      title: '3. if / elif / else (실행 흐름)',
      content:
        '검사해야 할 조건이 여러 개인 경우 elif를 사용합니다. 위에서부터 순서대로 검사하며, 조건이 True가 되는 "첫 번째" 블록만 실행하고 나머지는 무시합니다.\n(로직 흐름 추적을 적극 활용해주세요!)',
      code:
        'score = 85\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 70:\n    print("C")\nelse:\n    print("F")',
      exampleOutput: 'B',
      traceFlow: [0, 1, 3, 4],
      variableHistory: [
        { score: 85 },
        { score: 85 },
        { score: 85 },
        { score: 85 }
      ],
      explanations: [
        { id: 'ex4_6', codeLine: 2, title: '첫 번째 검사', text: '85는 90보다 작으므로 건너뜁니다.', type: 'red', badge: '1' },
        { id: 'ex4_7', codeLine: 4, title: '두 번째 검사', text: '85는 80보다 크므로 참입니다! "B"를 출력합니다.', type: 'green', badge: '2' },
        { id: 'ex4_8', codeLine: 6, title: '검사 중단', text: '위에서 이미 참이 나왔으므로 아래의 elif나 else는 실행되지 않습니다.', type: 'purple', badge: '!' }
      ]
    },

    {
      id: 'py4_p4',
      title: '4. 조건식의 True / False 평가',
      content:
        'if문의 조건식은 항상 True 또는 False로 평가됩니다. 파이썬에서 숫자는 0일 때 False로, 0이 아닌 모든 숫자(음수 포함)는 True로 판단됩니다.\n(로직 흐름 추적을 적극 활용해주세요!)',
      code:
        'if 10:\n    print("실행됨 (True)")\n\nif 0:\n    print("실행 안 됨 (False)")',
      exampleOutput: '실행됨 (True)',
      traceFlow: [0, 1, 3],
      variableHistory: [{}, {}, {}],
      explanations: [
        { id: 'ex4_9', codeLine: 0, title: '0이 아닌 숫자', text: '10은 0이 아니므로 True로 취급되어 블록이 실행됩니다.', type: 'blue', badge: 'T' },
        { id: 'ex4_10', codeLine: 3, title: '숫자 0', text: '0은 False로 취급되어 블록 내부가 실행되지 않습니다.', type: 'red', badge: 'F' }
      ]
    }
    
  ],
  conceptProblems: [
    {
      id: 'py4_c1',
      question: 'Q1. if 문의 조건식이 True일 때 발생하는 일로 올바른 것은?',
      options: ['if 블록은 건너뛴다', 'else 블록이 실행된다', 'if 블록 안의 코드가 실행된다', '프로그램이 종료된다'],
      answer: 'if 블록 안의 코드가 실행된다',
      hint: 'if는 "만약 ~라면"이라는 뜻입니다.',
      explanation: '조건이 참이면 해당 블록의 들여쓰기 된 코드가 실행됩니다.',
      type: 'concept'
    },
    {
      id: 'py4_c_extra',
      question: 'Q2. elif에 대한 설명으로 올바른 것은?',
      options: [
        '모든 elif가 실행된다',
        'True인 조건 아래도 계속 검사한다',
        '가장 마지막 elif만 실행된다',
        'True가 되는 첫 조건만 실행된다'
      ],
      answer: 'True가 되는 첫 조건만 실행된다',
      hint: '하나의 조건이 맞으면 나머지는 건너뜁니다.',
      explanation: 'elif 구조는 위에서부터 검사하다가 참인 것을 발견하면 실행 후 즉시 전체 조건문을 빠져나갑니다.',
      type: 'concept'
    },
    {
      id: 'py4_c3',
      question: 'Q3. 다음 코드의 출력 결과는 무엇인가요?\nx = 7\nif x > 10:\n    print("A")\nelif x > 5:\n    print("B")\nelse:\n    print("C")',
      options: ['A', 'B', 'C', '출력 없음'],
      answer: 'B',
      hint: '7이 어디에 해당하는지 순서대로 확인해보세요.',
      explanation: '7은 10보다 크지 않지만 5보다는 크므로 "B"가 출력됩니다.',
      type: 'concept'
    },
    {
      id: 'py4_c4',
      question: 'Q4. 다음 중 if 문의 조건식으로 사용할 수 없는 것은?',
      options: ['x > 3', 'x == 10', 'True', 'x = 5'],
      answer: 'x = 5',
      hint: '= 은 저장(대입)이고, == 이 비교입니다.',
      explanation: 'x = 5는 값을 저장하는 명령문이므로 조건식으로 사용할 수 없습니다.',
      type: 'concept'
    },
    {
      id: 'py4_c5',
      question: 'Q5. 다음 중 if문에서 False로 판단되는 값은 무엇인가요?',
      options: ['1', '-5', '100', '0'],
      answer: '0',
      hint: '파이썬에서 "없음" 혹은 "영"을 나타내는 값을 찾아보세요.',
      explanation: '숫자형 자료에서 0은 False로, 0이 아닌 정수나 실수는 모두 True로 평가됩니다.',
      type: 'concept'
    }
  ],
  codingProblems: [
    {
      id: 'py4_cp_extra',
      question: '문제 1. 점수를 입력받아 90 이상이면 "A", 80 이상이면 "B", 그 외에는 "C"를 출력하시오.',
      answer: 'score = int(input())\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelse:\n    print("C")',
      hint: 'if, elif, else 구조를 사용하여 점수 구간을 나누세요.',
      type: 'coding',
      exampleInput: '85',
      exampleOutput: 'B'
    },
    {
      id: 'py4_cp2',
      question: '문제 2. 정수를 하나 입력받아 0보다 크면 "양수", 0이면 "0", 0보다 작으면 "음수"를 출력하시오.',
      answer: 'x = int(input())\nif x > 0:\n    print("양수")\nelif x == 0:\n    print("0")\nelse:\n    print("음수")',
      hint: 'if, elif, else 세 가지 경우를 모두 사용하세요.',
      type: 'coding',
      exampleInput: '5',
      exampleOutput: '양수'
    },
    {
      id: 'py4_cp3',
      question: '문제 3. 정수를 하나 입력받아 짝수이면 "EVEN", 홀수이면 "ODD"를 출력하시오.',
      answer: 'n = int(input())\nif n % 2 == 0:\n    print("EVEN")\nelse:\n    print("ODD")',
      hint: '% 연산자를 사용하여 2로 나눈 나머지를 확인하세요.',
      type: 'coding',
      exampleInput: '4',
      exampleOutput: 'EVEN'
    },
    {
      id: 'py4_cp4',
      question: '문제 4. 정수 하나를 입력받아 0이 아니면 "YES"를 출력하시오.',
      answer: 'n = int(input())\nif n:\n    print("YES")',
      hint: 'if n: 구문을 사용하면 n이 0이 아닐 때 참이 됩니다.',
      type: 'coding',
      exampleInput: '10',
      exampleOutput: 'YES'
    }
  ]
};
