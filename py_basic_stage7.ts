
import { Lesson } from './types';

export const py_basic_stage7: Lesson = {
  id: 'py7',
  title: 'STEP 7. 문자열 처리',
  description: '문자열을 인덱스로 다루고 다양한 메서드를 활용하는 법을 배웁니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py7_p1',
      title: '1. 문자열 인덱싱',
      content:
        '문자열은 문자들의 순서 있는 집합입니다. 각 문자는 0부터 시작하는 번호(인덱스)를 가집니다. 파이썬에서는 음수 인덱스를 사용하여 뒤에서부터 접근할 수도 있습니다.',
      code: 's = "Python"\nprint(s[0])\nprint(s[5])\nprint(s[-1])',
      exampleOutput: 'P\nn\nn',
      traceFlow: [0, 1, 2, 3],
      variableHistory: [
        { s: 'Python' },
        { s: 'Python' },
        { s: 'Python' },
        { s: 'Python' }
      ],
      explanations: [
        { id: 'ex7_1', codeLine: 1, title: '첫 번째 문자', text: '인덱스 0은 가장 첫 번째 문자인 "P"를 가리킵니다.', type: 'blue', badge: '0' },
        { id: 'ex7_2', codeLine: 2, title: '여섯 번째 문자', text: '인덱스 5는 여섯 번째 문자인 "n"을 가리킵니다.', type: 'orange', badge: '5' },
        { id: 'ex7_3', codeLine: 3, title: '뒤에서 첫 번째', text: '-1은 문자열의 가장 마지막 문자를 의미합니다.', type: 'purple', badge: '-1' }
      ]
    },

    {
      id: 'py7_p2',
      title: '2. 문자열 길이',
      content:
        'len() 함수를 사용하면 문자열에 포함된 전체 문자의 개수(길이)를 구할 수 있습니다. 공백과 특수문자도 길이에 포함됩니다.',
      code: 's = "Hello Python"\nlength = len(s)\nprint(length)',
      exampleOutput: '12',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { s: 'Hello Python' },
        { s: 'Hello Python', length: 12 },
        { s: 'Hello Python', length: 12 }
      ],
      explanations: [
        { id: 'ex7_4', codeLine: 1, title: '길이 계산', text: 'len() 함수가 문자열 "Hello Python"의 길이인 12를 반환합니다.', type: 'green', badge: 'len' },
        { id: 'ex7_5', codeLine: 2, title: '결과 출력', text: '공백을 포함한 전체 글자 수가 화면에 표시됩니다.', type: 'yellow', badge: '1' }
      ]
    },

    {
      id: 'py7_p3',
      title: '3. 문자열 메서드',
      content:
        '문자열 뒤에 점(.)을 찍고 사용하는 전용 함수들을 메서드라고 합니다.\n- upper(): 모두 대문자로\n- lower(): 모두 소문자로\n- count("x"): "x"의 개수 세기\n- find("x"): "x"의 위치 찾기',
      code: 's = "apple"\nprint(s.upper())\nprint(s.count("p"))\nprint(s.find("e"))',
      exampleOutput: 'APPLE\n2\n4',
      traceFlow: [0, 1, 2, 3],
      variableHistory: [
        { s: 'apple' },
        { s: 'apple' },
        { s: 'apple' },
        { s: 'apple' }
      ],
      explanations: [
        { id: 'ex7_6', codeLine: 1, title: '대문자 변환', text: '"APPLE"이 출력됩니다.', type: 'blue', badge: 'A' },
        { id: 'ex7_7', codeLine: 2, title: '개수 세기', text: '"p"가 두 번 들어가 있으므로 2가 출력됩니다.', type: 'orange', badge: 'cnt' },
        { id: 'ex7_8', codeLine: 3, title: '위치 찾기', text: '"e"는 인덱스 4번에 위치하므로 4가 출력됩니다.', type: 'purple', badge: 'idx' }
      ]
    },

    {
      id: 'py7_p4',
      title: '4. 문자열 슬라이싱',
      content:
        '슬라이싱을 사용하면 문자열의 일부분을 잘라내어 새로운 문자열을 만들 수 있습니다.\n형식: s[시작:끝:증감]\n(끝 인덱스는 범위에 포함되지 않습니다)',
      code: 's = "Python"\nprint(s[1:4])\nprint(s[::2])',
      exampleOutput: 'yth\nPto',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { s: 'Python' },
        { s: 'Python' },
        { s: 'Python' }
      ],
      explanations: [
        { id: 'ex7_9', codeLine: 1, title: '부분 추출', text: '인덱스 1부터 3까지(4 미만)의 문자인 "yth"를 가져옵니다.', type: 'blue', badge: '1:4' },
        { id: 'ex7_10', codeLine: 2, title: '건너뛰기', text: '문자열 전체를 2칸 간격으로 가져옵니다. (P, t, o)', type: 'orange', badge: '::2' }
      ]
    },

    {
      id: 'py7_p5_extra',
      title: '5. 문자열의 불변성 (Immutable)',
      content:
        '문자열은 한 번 만들어지면 그 내용을 직접 수정할 수 없는 "불변" 자료형입니다. replace()나 upper() 같은 메서드들은 원본을 바꾸는 것이 아니라, 항상 "새로운 문자열"을 만들어 반환합니다.',
      code: 's = "hello"\ns.replace("h", "H")\nprint(s)\n\ns2 = s.replace("h", "H")\nprint(s2)',
      exampleOutput: 'hello\nHello',
      traceFlow: [0, 1, 2, 4, 5],
      variableHistory: [
        { s: 'hello' },
        { s: 'hello' },
        { s: 'hello' },
        { s: 'hello', s2: 'Hello' },
        { s: 'hello', s2: 'Hello' }
      ],
      explanations: [
        { id: 'ex7_11', codeLine: 1, title: '메서드 호출', text: 'h를 H로 바꾼 새로운 문자열을 만들지만, s에 다시 저장하지는 않았습니다.', type: 'orange', badge: 'skip' },
        { id: 'ex7_12', codeLine: 2, title: '원본 확인', text: '원본 s는 여전히 "hello"입니다. (불변성)', type: 'red', badge: 'orig' },
        { id: 'ex7_13', codeLine: 5, title: '새 변수에 저장', text: '바뀐 결과를 s2에 저장해야 변경된 값을 사용할 수 있습니다.', type: 'green', badge: 'new' }
      ]
    }
  ],
  conceptProblems: [
    {
      id: 'py7_c1',
      question: 'Q1. 다음 코드의 출력 결과는 무엇인가요?\ns = "Hello"\nprint(s[1])',
      options: ['H', 'e', 'l', 'o'],
      answer: 'e',
      hint: '인덱스는 0부터 시작한다는 점을 잊지 마세요.',
      explanation: 's[0]은 H이고, s[1]은 e입니다.',
      type: 'concept'
    },
    {
      id: 'py7_c2',
      question: 'Q2. len("Python")의 실행 결과로 올바른 것은 무엇인가요?',
      options: ['5', '6', '7', '에러'],
      answer: '6',
      hint: '글자 수를 하나씩 세어보세요.',
      explanation: 'P, y, t, h, o, n 총 6글자입니다.',
      type: 'concept'
    },
    {
      id: 'py7_c3',
      question: 'Q3. 문자열 s를 모두 대문자로 바꾸는 메서드는 무엇인가요?',
      options: ['s.big()', 's.upper()', 's.uppercase()', 's.toUpper()'],
      answer: 's.upper()',
      hint: '영단어 upper(위쪽/대문자)를 생각하세요.',
      explanation: 'upper() 메서드는 문자열의 모든 문자를 대문자로 변환한 새 문자열을 반환합니다.',
      type: 'concept'
    },
    {
      id: 'py7_c4',
      question: 'Q4. 문자열에서 특정 문자가 없는 경우 find() 메서드의 반환값은 무엇인가요?',
      options: ['0', 'None', '-1', '에러'],
      answer: '-1',
      hint: '찾지 못했다는 신호로 음수를 사용합니다.',
      explanation: 'find()는 찾는 문자열이 없을 때 -1을 반환하도록 설계되어 있습니다.',
      type: 'concept'
    },
    {
      id: 'py7_c5',
      question: 'Q5. s = "Python"일 때 s[1:4]의 실행 결과는 무엇인가요?',
      options: ['Pyt', 'yth', 'tho', 'ytho'],
      answer: 'yth',
      hint: '인덱스 1부터 3(4 미만)까지의 글자를 확인하세요.',
      explanation: '인덱스 1(y), 2(t), 3(h)이 추출되어 "yth"가 됩니다.',
      type: 'concept'
    },
    {
      id: 'py7_c6_extra',
      question: 'Q6. 문자열이 불변(Immutable)이라는 의미로 올바른 설명은 무엇인가요?',
      options: [
        '문자열은 삭제할 수 없다',
        '문자열은 직접 수정할 수 없다',
        '문자열은 출력할 수 없다',
        '문자열은 반복할 수 없다'
      ],
      answer: '문자열은 직접 수정할 수 없다',
      hint: '내용을 갈아끼울 수 있는지 생각해보세요.',
      explanation: '불변성은 한 번 생성된 객체의 내부 상태를 변경할 수 없음을 의미합니다. 수정을 원하면 새로운 문자열을 생성해야 합니다.',
      type: 'concept'
    }
  ],
  codingProblems: [
    {
      id: 'py7_cp1',
      question: '문제 1. 문자열을 입력받아 첫 번째 문자와 마지막 문자를 출력하시오.',
      answer: 's = input()\nprint(s[0], s[-1])',
      hint: '인덱스 0과 -1을 활용하면 쉽습니다.',
      type: 'coding',
      exampleInput: 'StepCode',
      exampleOutput: 'S e'
    },
    {
      id: 'py7_cp2',
      question: '문제 2. 문자열을 입력받아 그 길이를 출력하시오.',
      answer: 's = input()\nprint(len(s))',
      hint: 'len() 함수를 사용하세요.',
      type: 'coding',
      exampleInput: 'Python',
      exampleOutput: '6'
    },
    {
      id: 'py7_cp3',
      question: '문제 3. 문자열을 입력받아 문자 "a"의 개수를 출력하시오.',
      answer: 's = input()\nprint(s.count("a"))',
      hint: 'count() 메서드를 사용하세요.',
      type: 'coding',
      exampleInput: 'banana',
      exampleOutput: '3'
    },
    {
      id: 'py7_cp4',
      question: '문제 4. 문자열을 입력받아 앞의 3글자만 출력하시오.',
      answer: 's = input()\nprint(s[:3])',
      hint: '슬라이싱 s[:3]을 사용하면 처음부터 인덱스 2까지 가져옵니다.',
      type: 'coding',
      exampleInput: 'Python',
      exampleOutput: 'Pyt'
    },
    {
      id: 'py7_cp5_extra',
      question: '문제 5. 문자열 s를 입력받아 대문자로 변환하여 s2라는 새 변수에 저장하고 s2를 출력하시오.',
      answer: 's = input()\ns2 = s.upper()\nprint(s2)',
      hint: 'upper() 메서드는 결과값을 반환하므로 이를 변수에 대입해야 합니다.',
      type: 'coding',
      exampleInput: 'hello',
      exampleOutput: 'HELLO'
    }
  ]
};
