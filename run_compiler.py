from compiler import Compiler
import json

def main():
    # Create compiler instance
    compiler = Compiler()
    
    # Read test program
    with open('test_program.txt', 'r') as f:
        code = f.read()
    
    print("Performing lexical analysis...")
    tokens = compiler.lexical_analysis(code)
    print("\nTokens:")
    for token in tokens:
        print(f"Line {token['line']}: {token['type']} = {token['value']}")
    
    print("\nPerforming syntax analysis...")
    ast = compiler.syntax_analysis(code)
    
    print("\nPerforming semantic analysis...")
    semantic_result = compiler.semantic_analysis(ast)
    print("\nSymbol Table:")
    print(json.dumps(semantic_result['symbol_table'], indent=2))
    
    print("\nGenerating IR code...")
    ir_code = compiler.generate_ir(ast)
    print("\nIR Code:")
    for instr in ir_code:
        print(instr)
    
    print("\nGenerating machine code...")
    machine_code = compiler.generate_machine_code(ir_code)
    print("\nMachine Code:")
    for instr in machine_code:
        print(instr)
    
    print("\nGenerating final executable...")
    executable = compiler.link_code(machine_code)
    print("\nExecutable generated successfully!")

if __name__ == "__main__":
    main() 