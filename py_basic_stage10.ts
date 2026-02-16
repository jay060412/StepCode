
import { Lesson } from './types';

export const py_basic_stage10: Lesson = {
  id: 'py10',
  title: 'STEP 10. 파일 입출력',
  description: '파일을 열고 읽고 쓰는 법을 배워 데이터를 영구적으로 저장하는 기술을 익힙니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py10_p1',
      title: '1. 파일 열기 (open)와 모드',
      content:
        '컴퓨터의 파일을 다루려면 먼저 open() 함수를 사용해야 합니다. 이때 어떤 용도로 열지 "모드"를 정해야 합니다.\n- r (Read): 읽기 전용\n- w (Write): 새로 쓰기 (기존 내용 삭제)\n- a (Append): 이어 쓰기 (끝에 내용 추가)',
      code: 'f = open("data.txt", "w")\nf.write("Hello World")\nf.close()',
      exampleOutput: '파일 data.txt 생성 및 내용 저장 (출력 없음)',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { f: '파일 객체 (쓰기 모드)' },
        { f: '파일 객체 (내용: Hello World)' },
        {}
      ],
      explanations: [
        { id: 'ex10_1', codeLine: 0, title: '파일 열기', text: '"data.txt" 파일을 쓰기(w) 모드로 엽니다.', type: 'blue', badge: 'open' },
        { id: 'ex10_2', codeLine: 1, title: '데이터 기록', text: '파일 안에 내용을 작성합니다.', type: 'green', badge: '1' },
        { id: 'ex10_3', codeLine: 2, title: '파일 닫기', text: '사용이 끝난 파일은 반드시 닫아주어야 안전합니다.', type: 'red', badge: 'close' }
      ]
    },
    {
      id: 'py10_p2',
      title: '2. 파일 읽기',
      content:
        '저장된 파일의 내용을 가져올 때는 읽기(r) 모드로 열고 read()나 readline()을 사용합니다.',
      code: 'f = open("data.txt", "r")\ncontent = f.read()\nprint(content)\nf.close()',
      exampleOutput: 'Hello World',
      traceFlow: [0, 1, 2, 3],
      variableHistory: [
        { f: '파일 객체 (읽기 모드)' },
        { f: '파일 객체 (읽기 모드)', content: 'Hello World' },
        { f: '파일 객체 (읽기 모드)', content: 'Hello World' },
        {}
      ],
      explanations: [
        { id: 'ex10_4', codeLine: 1, title: '전체 읽기', text: '파일의 모든 내용을 하나의 문자열로 가져옵니다.', type: 'purple', badge: 'read' },
        { id: 'ex10_5', codeLine: 2, title: '출력', text: '가져온 내용을 화면에 보여줍니다.', type: 'yellow', badge: '1' }
      ]
    },
    {
      id: 'py10_p3',
      title: '3. with 문 사용하기',
      content:
        'with 문을 사용하면 파일을 다 사용한 뒤 자동으로 닫아주기 때문에 훨씬 안전하고 편리합니다. 파이썬에서 가장 권장되는 방식입니다.',
      code: 'with open("test.txt", "r") as f:\n    data = f.read()\n    print(data)',
      exampleOutput: '파일 내용 출력',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { f: '파일 객체 (with 블록)' },
        { f: '파일 객체 (data 읽힘)', data: '파일 내용' },
        {}
      ],
      explanations: [
        { id: 'ex10_6', codeLine: 0, title: '자동 닫기', text: 'with 블록이 끝나면 f.close()를 자동으로 실행합니다.', type: 'green', badge: 'with' },
        { id: 'ex10_7', codeLine: 1, title: '읽기 작업', text: '들여쓰기 된 안쪽 공간에서 파일 작업을 수행합니다.', type: 'blue', badge: '1' }
      ]
    }
  ],
  conceptProblems: [
    {
      id: 'py10_c1',
      question: 'Q1. 파일을 읽기 전용으로 열 때 사용하는 모드는 무엇인가요?',
      options: ['w', 'a', 'r', 'x'],
      answer: 'r',
      hint: 'Read의 약자를 생각해보세요.',
      explanation: 'r 모드는 파일을 읽기 위해 여는 기본 모드입니다.',
      type: 'concept'
    },
    {
      id: 'py10_c2',
      question: 'Q2. 다음 중 파일을 열기 위해 반드시 먼저 호출해야 하는 함수는 무엇인가요?',
      options: ['read()', 'write()', 'open()', 'close()'],
      answer: 'open()',
      hint: '문을 열어야 안으로 들어갈 수 있습니다.',
      explanation: '파일 작업을 시작하려면 open() 함수를 통해 파일 객체를 생성해야 합니다.',
      type: 'concept'
    },
    {
      id: 'py10_c3',
      question: 'Q3. with 문을 사용하는 가장 큰 장점은 무엇인가요?',
      options: [
        '파일을 더 빠르게 읽기 위해',
        '파일을 자동으로 닫아주기 위해',
        '파일 이름을 숨기기 위해',
        '파일을 여러 개 동시에 열기 위해'
      ],
      answer: '파일을 자동으로 닫아주기 위해',
      hint: 'close()를 깜빡해도 괜찮은 이유입니다.',
      explanation: 'with 구문을 사용하면 블록을 나갈 때 시스템이 자동으로 파일을 닫아 리소스 누수를 방지합니다.',
      type: 'concept'
    },
    {
      id: 'py10_c4',
      question: 'Q4. 다음 중 기존 파일의 내용을 모두 지우고 새로 쓰는 모드는 무엇인가요?',
      options: ['r', 'a', 'w', 'rw'],
      answer: 'w',
      hint: 'Write(쓰기) 모드는 덮어쓰기가 기본입니다.',
      explanation: 'w 모드는 파일이 이미 존재하면 내용을 삭제하고 새로 만들며, 없으면 파일을 생성합니다.',
      type: 'concept'
    }
  ],
  codingProblems: [
    {
      id: 'py10_cp1',
      question: '문제 1. hello.txt 파일에 "Hello Python"이라는 문자열을 저장하시오. (with 문 사용)',
      answer: 'with open("hello.txt", "w") as f:\n    f.write("Hello Python")',
      hint: 'open("파일명", "w") 모드를 사용하세요.',
      type: 'coding'
    },
    {
      id: 'py10_cp2',
      question: '문제 2. hello.txt 파일의 내용을 읽어 화면에 출력하시오. (with 문 사용)',
      answer: 'with open("hello.txt", "r") as f:\n    print(f.read())',
      hint: 'r 모드로 열고 f.read()의 결과를 print 하세요.',
      type: 'coding'
    },
    {
      id: 'py10_cp3',
      question: '문제 3. numbers.txt 파일에 1부터 5까지의 숫자를 한 줄씩 저장하시오.',
      answer: 'with open("numbers.txt", "w") as f:\n    for i in range(1, 6):\n        f.write(str(i) + "\\n")',
      hint: '반복문과 \\n(줄바꿈)을 활용하세요. 숫자는 str()로 변환해야 합니다.',
      type: 'coding'
    }
  ]
};
