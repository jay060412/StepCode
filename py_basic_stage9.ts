
import { Lesson } from './types';

export const py_basic_stage9: Lesson = {
  id: 'py9',
  title: 'STEP 9. 클래스 & 객체',
  description: '객체지향 프로그래밍의 핵심, 설계도와 실제 물건의 개념을 배웁니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py9_p1',
      title: '1. 클래스와 객체',
      content:
        '클래스는 객체를 만들기 위한 "설계도"입니다. 붕어빵 틀(클래스)로 여러 개의 붕어빵(객체)을 찍어내는 것과 같습니다. 같은 클래스로 만들어진 객체들은 같은 구조를 가집니다.',
      code: 'class Student:\n    pass\n\ns1 = Student()\ns2 = Student()',
      exampleOutput: '객체 2개 생성 (출력 없음)',
      traceFlow: [0, 3, 4],
      variableHistory: [
        {},
        { s1: 'Student 객체' },
        { s1: 'Student 객체', s2: 'Student 객체' }
      ],
      explanations: [
        { id: 'ex9_1', codeLine: 0, title: '클래스 정의', text: 'class 키워드로 새로운 설계도를 만듭니다. 이름은 보통 대문자로 시작합니다.', type: 'blue', badge: 'class' },
        { id: 'ex9_2', codeLine: 3, title: '객체 생성', text: '클래스 이름 뒤에 괄호를 붙여 실제 객체(인스턴스)를 만듭니다.', type: 'green', badge: 'obj' },
        { id: 'ex9_3', codeLine: 4, title: '독립성', text: 's1과 s2는 같은 설계도로 만들어졌지만 서로 다른 개별 객체입니다.', type: 'orange', badge: '!' }
      ]
    },

    {
      id: 'py9_p2',
      title: '2. __init__ 메서드와 속성',
      content:
        '__init__은 객체가 생성될 때 자동으로 실행되는 특별한 함수입니다. 주로 객체의 초기값(이름, 나이 등)을 설정할 때 사용합니다.',
      code: 'class Student:\n    def __init__(self, name):\n        self.name = name\n\ns = Student("지니")\nprint(s.name)',
      exampleOutput: '지니',
      traceFlow: [1, 2, 4, 5],
      variableHistory: [
        {},
        {},
        { s: { name: '지니' } },
        { s: { name: '지니' } }
      ],
      explanations: [
        { id: 'ex9_4', codeLine: 1, title: '생성자', text: '__init__은 객체가 태어날 때 딱 한 번 실행됩니다.', type: 'purple', badge: 'init' },
        { id: 'ex9_5', codeLine: 2, title: '속성 저장', text: 'self.name은 이 객체만이 가지는 고유한 변수(속성)가 됩니다.', type: 'yellow', badge: 'attr' },
        { id: 'ex9_6', codeLine: 5, title: '속성 접근', text: '객체명.속성명 형식으로 저장된 값을 가져올 수 있습니다.', type: 'blue', badge: '.' }
      ]
    },

    {
      id: 'py9_p3',
      title: '3. 메서드와 self',
      content:
        '클래스 안에 정의된 함수를 "메서드"라고 합니다. 메서드의 첫 번째 매개변수는 항상 self여야 하며, 이는 현재 그 메서드를 실행하고 있는 "객체 자신"을 가리킵니다.',
      code:
        'class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        print(f"{self.name}: 멍멍!")\n\nmy_dog = Dog("초코")\nmy_dog.bark()',
      exampleOutput: '초코: 멍멍!',
      traceFlow: [1, 2, 6, 7, 8],
      variableHistory: [
        {},
        {},
        {},
        { my_dog: { name: '초코' } },
        { my_dog: { name: '초코' } }
      ],
      explanations: [
        { id: 'ex9_7', codeLine: 4, title: '메서드 정의', text: '객체가 할 수 있는 행동을 정의합니다. self가 꼭 필요합니다.', type: 'green', badge: 'def' },
        { id: 'ex9_8', codeLine: 5, title: 'self 활용', text: 'self를 통해 객체 내부에 저장된 데이터에 접근합니다.', type: 'orange', badge: 'self' },
        { id: 'ex9_9', codeLine: 8, title: '메서드 실행', text: '객체를 통해 행동을 명령합니다. 호출 시 self는 자동으로 전달됩니다.', type: 'blue', badge: 'call' }
      ]
    }
  ],
  conceptProblems: [
    {
      id: 'py9_c1',
      question: 'Q1. 클래스와 객체의 관계로 올바른 것은 무엇인가요?',
      options: [
        '클래스는 객체의 복사본이다',
        '객체는 클래스를 저장하는 변수이다',
        '클래스는 객체를 만들기 위한 설계도이다',
        '객체는 클래스보다 먼저 만들어진다'
      ],
      answer: '클래스는 객체를 만들기 위한 설계도이다',
      hint: '붕어빵 틀과 붕어빵의 관계를 생각해보세요.',
      explanation: '클래스는 데이터의 구조와 행동을 정의하는 설계도이며, 이를 통해 만들어진 실제 데이터를 객체라고 합니다.',
      type: 'concept'
    },
    {
      id: 'py9_c2',
      question: 'Q2. 객체가 생성될 때 자동으로 실행되어 초기화를 돕는 메서드는 무엇인가요?',
      options: ['start', 'init', '__init__', 'main'],
      answer: '__init__',
      hint: '언더바(_)가 앞뒤로 두 개씩 붙어 있습니다.',
      explanation: '__init__ 메서드는 파이썬의 특수 메서드로, 인스턴스화될 때 자동으로 호출됩니다.',
      type: 'concept'
    },
    {
      id: 'py9_c3',
      question: 'Q3. 클래스 내부 메서드에서 사용되는 self의 의미로 올바른 것은 무엇인가요?',
      options: [
        '클래스 전체를 가리킨다',
        '현재 생성된 객체 자신을 가리킨다',
        '모든 객체를 동시에 가리킨다',
        '전역 변수를 가리킨다'
      ],
      answer: '현재 생성된 객체 자신을 가리킨다',
      hint: '영어 단어 self(자신)의 뜻 그대로입니다.',
      explanation: 'self는 인스턴스 메서드가 호출될 때 현재 호출한 인스턴스 객체를 전달받는 관례적인 이름입니다.',
      type: 'concept'
    },
    {
      id: 'py9_c4',
      question: 'Q4. 다음 코드의 출력 결과는 무엇인가요?\nclass Test:\n    def __init__(self):\n        self.x = 5\nt = Test()\nprint(t.x)',
      options: ['x', '0', '5', '에러'],
      answer: '5',
      hint: 't라는 객체가 만들어질 때 x에 어떤 값이 들어가는지 보세요.',
      explanation: 't = Test()가 실행될 때 __init__이 호출되어 self.x에 5가 저장되므로 t.x는 5입니다.',
      type: 'concept'
    }
  ],
  codingProblems: [
    {
      id: 'py9_cp1',
      question: '문제 1. Person 클래스를 만들고, 생성자(__init__)에서 name 속성을 저장한 뒤 객체를 생성하여 이름을 출력하시오.',
      answer: 'class Person:\n    def __init__(self, name):\n        self.name = name\n\np = Person("지니")\nprint(p.name)',
      hint: 'class Person: 으로 시작하고 __init__ 내부에 self.name = name을 작성하세요.',
      type: 'coding',
      exampleOutput: '지니'
    },
    {
      id: 'py9_cp2',
      question: '문제 2. Student 클래스를 만드시오.\n1. 생성자에서 name, score를 저장한다.\n2. score가 60 이상이면 "PASS", 아니면 "FAIL"을 출력하는 result 메서드를 작성하시오.',
      answer: 'class Student:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n\n    def result(self):\n        if self.score >= 60:\n            print("PASS")\n        else:\n            print("FAIL")\n\ns = Student("지니", 75)\ns.result()',
      hint: '메서드 안에서 속성을 사용할 때는 self.score 처럼 self를 붙여야 합니다.',
      type: 'coding',
      exampleOutput: 'PASS'
    },
    {
      id: 'py9_cp3',
      question: '문제 3. Counter 클래스를 만드시오.\n1. 생성자에서 value를 0으로 초기화한다.\n2. increase 메서드를 호출할 때마다 value가 1씩 증가하도록 작성하시오.',
      answer: 'class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def increase(self):\n        self.value += 1\n\nc = Counter()\nc.increase()\nc.increase()\nprint(c.value)',
      hint: 'increase 메서드 내부에서 self.value의 값을 변경하세요.',
      type: 'coding',
      exampleOutput: '2'
    }
  ]
};
